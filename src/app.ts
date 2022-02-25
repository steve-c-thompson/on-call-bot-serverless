import {App, AwsLambdaReceiver, LogLevel} from '@slack/bolt';
import {SlackBot} from "./bot/SlackBot";
import {RespondArguments} from "@slack/bolt/dist/types/utilities";
import {APIGatewayProxyEvent, EventBridgeEvent} from "aws-lambda";
import {GoogleSheetScheduleDataLoader} from "./data/GoogleSheetScheduleDataLoader";
import {ScheduleData} from "./model/ScheduleData";
import {AwsSecretsDataSource} from "./secrets/AwsSecretsDataSource";
import {context, logger} from "./secrets/utils";

let app: App;
const dataSource = new AwsSecretsDataSource(context.secretsManager);

let awsLambdaReceiver: AwsLambdaReceiver;

let slackBot : SlackBot;
let dataLoaderSheet : GoogleSheetScheduleDataLoader;

const init = async () => {
    logger.debug("Executing async init");
    const signingSecret = await dataSource.signingSecret();
    const slackBotToken = await dataSource.slackBotToken()
    awsLambdaReceiver = new AwsLambdaReceiver({
        signingSecret: signingSecret,
        // logLevel: LogLevel.DEBUG
    });
    app = new App({
        token: slackBotToken,
        receiver: awsLambdaReceiver,
        // logLevel: LogLevel.DEBUG,
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
                message = await slackBot.handleScheduleRequest(true);
                break;
            case "schedule":
                message = await slackBot.handleScheduleRequest();
                break;
            case "help":
                message = "How to use /oncall"
                attachments.push({"text": "`/oncall now` to see who is on call right now."
                        + "\n`/oncall schedule` to see the next few weeks of schedule, only visible to you"
                        + "\n`/oncall post schedule` to post the next few weeks of schedule and @ listed users"
                        + "\n`/oncall refresh` to refresh data from the spreadsheet"
                        + "\nThe message `:arrow_right: *On-call Reminder* :arrow_left:` will trigger a schedule `now` + `post schedule`"
                });
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

    const msgRegex = /:arrow_right:\s*\*On-call Reminder\*\s*:arrow_left:/;
    app.message(msgRegex,  async ({ message, say }) => {
        // @ts-ignore
        if(message.subtype !== 'reminder_add') {
            const msg = await slackBot.handleReminderRequest(true);

            try {
                await say(msg);
            } catch (e) {
                logger.error("Error messing message", e);
            }
        }
    });

    return await awsLambdaReceiver.start();
}

/**
 * Init function to load the sheet data and create a new slackBot
 * Runs only if a slackBot has not been created.
 */
const initBot = async(): Promise<SlackBot> => {
    if(!slackBot) {
        const googleSheetId = await dataSource.googleSheetId();
        logger.info("SLACK_GOOGLE_SHEET_ID: " + googleSheetId);
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
module.exports.handler = async (event:APIGatewayProxyEvent & EventBridgeEvent<any, any>, context:any, callback:any) => {
    const handler = await initPromise;
    logger.debug("EVENT RECEIVED " + JSON.stringify(event));
    if (event.source === 'aws.events') {
        logger.debug('aws.event received - Lambda is warm');
        return 'Lambda is warm!';
    }
    return handler(event, context, callback);
}
