import * as AWS from "aws-sdk";
import {SecretsManager} from "@aws-sdk/client-secrets-manager";

export type Stage = "dev" | "prod" | "local";

export const context = isLocal() ? createLocalContext() : createContext();

export interface Context {
    secretsManager : SecretsManager;
}

function createContext(): Context {
    return {
        secretsManager: new SecretsManager({})
    };
}

function isLocal(): boolean {
    return process.env.NODE_ENV === "local";
}

function createLocalContext(): Context {
    AWS.config.update({
        accessKeyId: "not-a-real-access-key-id",
        secretAccessKey: "not-a-real-access-key",
        region: "us-west-2",
        // Uncomment to see localstack calls in the console
        // logger: console,
    });

    return {
        secretsManager: new SecretsManager({
            endpoint: "http://localhost:4566",
            credentials: {
                accessKeyId: AWS.config.credentials?.accessKeyId!,
                secretAccessKey: AWS.config.credentials?.secretAccessKey!
            },
            region: AWS.config.region,
        }),
    };
}

class AwsInfo {
    getAccountNumber(): string {
        return process.env.CDK_DEFAULT_ACCOUNT || "146543024844";
    }

    getRegion(): string {
        return process.env.CDK_DEFAULT_REGION || "us-east-2";
    }

    getSecretName(): string {
        return "OncallSlackBot-serverless-prod";
    }
}

export const awsInfo = new AwsInfo();

export async function getSecretValue(sm: SecretsManager, secretName : string) {
    try {
        const data = await sm.getSecretValue(({
            SecretId: secretName
        }));

        if(data) {
            if (data.SecretString) {
                const secret = data.SecretString;
                const parsedSecret = JSON.parse(secret);
                return parsedSecret;
            }

            return data.SecretBinary!.toString();
        }
    }
    catch (e) {
        console.log('Error retrieving secrets');
        console.log(e);
    }
    return undefined;
}