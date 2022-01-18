import {SecretsManager} from "@aws-sdk/client-secrets-manager";
import {OncallSecret, SecretDataSource} from "./SecretDataSource";
import {context, getSecretValue, logger} from "./utils";

export class AwsSecretsDataSource implements SecretDataSource{
    secretsManager: SecretsManager;
    constructor(sm : SecretsManager) {
        this.secretsManager = sm;
    }

    async buildSecretPromise(secretToken: string) : Promise<string> {
        return new Promise((resolve, reject) => {
            let sp = getSecretValue(this.secretsManager, context.secretName);
            sp.then((sec) => {
                if(sec) {
                    // Ugly casting to get the secret into correct format
                    const secCast = sec as unknown as OncallSecret;
                    const val = secCast[secretToken as keyof OncallSecret];
                    resolve(val);
                }
                else {
                    reject(`Secret ${secretToken} not found`);
                }
            }).catch((reason) => {
                logger.error(`Error fetching ${secretToken}: `, reason);
                reject(reason);
            });
        });
    }

    googlePrivateKey() {
        return this.buildSecretPromise("GOOGLE_PRIVATE_KEY");
    }
    googleServiceAccountEmail() {
        return this.buildSecretPromise("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    }
    signingSecret() {
        return this.buildSecretPromise("SLACK_SIGNING_SECRET");
    }
    slackBotToken() {
        return this.buildSecretPromise("SLACK_BOT_TOKEN");
    }
    googleSheetId() {
        return this.buildSecretPromise("SLACK_GOOGLE_SHEET_ID");
    }

}