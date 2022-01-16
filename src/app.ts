import {App, AwsLambdaReceiver, LogLevel} from '@slack/bolt';
import {SlackBot} from "./bot/SlackBot";
import {RespondArguments} from "@slack/bolt/dist/types/utilities";
import {APIGatewayProxyEvent} from "aws-lambda";
import {GoogleSheetScheduleDataLoader} from "./data/GoogleSheetScheduleDataLoader";
import {ScheduleData} from "./model/ScheduleData";
import {AwsSecretsDataSource} from "./secrets/AwsSecretsDataSource";
import {context} from "./secrets/utils";

let app: App;
const dataSource = new AwsSecretsDataSource(context.secretsManager);

let awsLambdaReceiver: AwsLambdaReceiver;

let slackBot : SlackBot;
let dataLoaderSheet : GoogleSheetScheduleDataLoader;

const init = async () => {
    // console.log("Executing async init");
    const signingSecret = await dataSource.signingSecret();
    const slackBotToken = await dataSource.slackBotToken()
    awsLambdaReceiver = new AwsLambdaReceiver({
        signingSecret: signingSecret,
        logLevel: LogLevel.DEBUG
    });
    app = new App({
        token: slackBotToken,
        receiver: awsLambdaReceiver,
        logLevel: LogLevel.DEBUG,
    });

    app.command("/oncall", async ({ command, ack, respond }) => {
        // console.log("Handling /oncall command " + command.text);
        await ack();

        let args = command.text;
        if(!args) {
            args = "schedule";
        }
        let message;
        let response_type = "ephemeral";
        let attachments = [];
        switch(args) {
            case "refresh":
                // do not await this refresh because the response could time out
                asyncDataRefresh(slackBot, dataLoaderSheet);
                message = "Schedule refreshed from data";
                break;
            case "now":
                message = await slackBot.handleNowRequest();
                response_type = "in_channel";
                break;
            case "post schedule":
                response_type = "in_channel";
            // fall through
            case "schedule":
                message = await slackBot.handleScheduleRequest();
                break;
            case "help":
                message = "How to use /oncall"
                attachments.push({"text": "'/oncall now' to see who is on call right now."
                        + "\n'/oncall schedule' to see the next few weeks of schedule"
                        + "\n'/oncall post schedule' to post the next few weeks of schedule"
                        + "\n'/oncall refresh' to refresh data from the spreadsheet"});
                break;
            default:
                message = "Command not recognized. Use '/oncall help' for more information.";
        }
        // cast response_type since it is constrained
        await respond({
            response_type: response_type as RespondArguments["response_type"],
            text: message,
            attachments: attachments
        });
    });

    slackBot = await initBot();

    const msgRegex = ':arrow_right: *On-call /now* :arrow_left:';
    app.message(msgRegex,  async ({ message, say }) => {
        const msg = await slackBot.handleNowRequest();

        try {
            await say(msg);
        } catch (e) {
            console.log("Error messing message", e);
        }
    });
    // Need to call writeToChannel somehow
    // May need a middleware here
    // if (event.source === 'serverless-plugin-warmup') {
    //     console.log('WarmUp - Lambda is warm!');
    //     return 'Lambda is warm!';
    // }
    //app.client.
    return await awsLambdaReceiver.start();
}

/**
 * Init function to load the sheet data and create a new slackBot
 * Runs only if a slackBot has not been created.
 */
const initBot = async(): Promise<SlackBot> => {
    if(!slackBot) {
        const googleSheetId = await dataSource.googleSheetId();
        console.log("SLACK_GOOGLE_SHEET_ID: " + googleSheetId);
        dataLoaderSheet = new GoogleSheetScheduleDataLoader(googleSheetId);
        const scheduleData = await loadSheet(dataLoaderSheet);
        return new SlackBot(scheduleData);
    }
    else {
        return slackBot;
    }
}

const asyncDataRefresh = async (slackBot: SlackBot, dataLoaderSheet: GoogleSheetScheduleDataLoader) => {
    const scheduleData = await loadSheet(dataLoaderSheet);
    await slackBot.refresh(scheduleData);
}

const loadSheet = async (dataLoaderSheet: GoogleSheetScheduleDataLoader) : Promise<ScheduleData> => {
    return dataLoaderSheet.init({
        accountEmail: await dataSource.googleServiceAccountEmail(),
        privateKey: await dataSource.googlePrivateKey()
    });
}

const initPromise = init();

// Handle the Lambda function event
module.exports.handler = async (event:APIGatewayProxyEvent, context:any, callback:any) => {
    const handler = await initPromise;
    return handler(event, context, callback);
}
