import {SecretDataSource} from "./SecretDataSource";
import process from "node:process";

export class EnvSecretDataSource implements SecretDataSource {
    googlePrivateKey: string;
    googleServiceAccountEmail: string;
    signingSecret: string;
    slackBotToken: string;
    googleSheetId: string;

    constructor() {
        this.googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY!;
        this.googleServiceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
        this.signingSecret = process.env.SLACK_SIGNING_SECRET!;
        this.slackBotToken = process.env.SLACK_BOT_TOKEN!;
        this.googleSheetId = process.env.SLACK_GOOGLE_SHEET_ID!;
    }
}