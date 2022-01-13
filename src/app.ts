import {App as BoltApp, AwsLambdaReceiver, LogLevel} from '@slack/bolt';
import {SlackBot} from "./bot/SlackBot";
import {RespondArguments} from "@slack/bolt/dist/types/utilities";
import {APIGatewayProxyEvent} from "aws-lambda";
import {GoogleSheetScheduleDataLoader} from "./data/GoogleSheetScheduleDataLoader";
import {ScheduleData} from "./model/ScheduleData";
import {AwsSecretsDataSource} from "./secrets/AwsSecretsDataSource";
import {context} from "./secrets/utils";

require('dotenv').config({ path: require('find-config')('.env') })

let boltApp: BoltApp;
// const dataSource = new EnvSecretDataSource();
const dataSource = new AwsSecretsDataSource(context.secretsManager);

// Initialize by executing async function on startup. This is due to promised being returned from the dataSource, and
// needing to wait for those in ctors.
(async () => {
    receiver = new AwsLambdaReceiver({
        signingSecret:  await dataSource.signingSecret(),
    });
    boltApp = new BoltApp({
        token: await dataSource.slackBotToken(),
        receiver: receiver,
        // processBeforeResponse: true
        logLevel: LogLevel.DEBUG,
    });

    boltApp.command("/oncall", async ({ command, ack, respond }) => {
        // Acknowledge command request
        console.log("Handling /oncall command " + command.text);
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
})()

let receiver: AwsLambdaReceiver;

let slackBot : SlackBot;
let dataLoaderSheet : GoogleSheetScheduleDataLoader;

/**
 * Init function to load the sheet data and create a new slackBot
 * Runs only if a slackBot has not been created.
 */
async function init() {
    if(!slackBot) {
        const googleSheetId = await dataSource.googleSheetId();
        console.log("SLACK_GOOGLE_SHEET_ID: " + googleSheetId);
        dataLoaderSheet = new GoogleSheetScheduleDataLoader(googleSheetId);
        const scheduleData = await loadSheet(dataLoaderSheet);
        slackBot = new SlackBot(scheduleData);
    }
}


async function asyncDataRefresh(slackBot: SlackBot, dataLoaderSheet: GoogleSheetScheduleDataLoader) {
    const scheduleData = await loadSheet(dataLoaderSheet);
    await slackBot.refresh(scheduleData);
}

// function writeToChannels(message: string, res: Response) {
//     // write to channels - be sure to add the bot to the channels or this will fail
//     const ids = slackBot.getSlackChannelIds();
//     let requests = ids.map(id => {
//         return new Promise((resolve, reject) => {
//             boltApp.client.chat.postMessage({
//                 channel: id,
//                 text: message
//             }).then(result => {
//                 if (result.error) {
//                     reject(result.error);
//                 } else {
//                     resolve(result.message);
//                 }
//             }).catch(e => {
//                 reject(e);
//             });
//
//         });
//     });
//     Promise.all(requests)
//         .then(() => {
//             res.send("Success");
//         })
//         .catch(err => {
//             console.log(err);
//             res.send("Error in call - check the logs");
//             return err;
//         });
//
// }
// receiver.router.post("/oncall-now", (req, res) => {
//     // write to channels - be sure to add the bot to the channels or this will fail
//     slackBot.handleNowRequest().then(msg => {
//         writeToChannels(msg, res);
//     }).catch((e: Error) => {
//         res.send("Error in call - check the logs");
//         console.log(e);
//     })
// });

async function loadSheet(dataLoaderSheet: GoogleSheetScheduleDataLoader) : Promise<ScheduleData> {
    return dataLoaderSheet.init({
        accountEmail: await dataSource.googleServiceAccountEmail(),
        privateKey: await dataSource.googlePrivateKey()
    });
}

// Handle the Lambda function event
module.exports.handler = async (event:APIGatewayProxyEvent, context:any, callback:any) => {
    await init();
    console.log("Starting receiver...");
    const handler = await receiver.start();
    return handler(event, context, callback);
}
