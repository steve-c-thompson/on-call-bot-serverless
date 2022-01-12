import {SecretDataSource} from "./SecretDataSource";
import process from "node:process";

export class EnvSecretDataSource implements SecretDataSource {
    googlePrivateKey() {
        return this.buildEnvPromise("GOOGLE_PRIVATE_KEY");
    }
    googleServiceAccountEmail() {
        return this.buildEnvPromise("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    }
    signingSecret() {
        return this.buildEnvPromise("SLACK_SIGNING_SECRET");
    }
    slackBotToken() {
        return this.buildEnvPromise("SLACK_BOT_TOKEN");
    }
    googleSheetId() {
        return this.buildEnvPromise("SLACK_GOOGLE_SHEET_ID");
    }

    buildEnvPromise(varName: string) : Promise<string> {
        return new Promise((resolve, reject) => {
            if(process.env[varName]) {
                resolve(process.env[varName]!);
            }
            else {
                reject(`${varName} not found`);
            }
        });
    }
}