import * as AWS from "aws-sdk";
import {SecretsManager} from "@aws-sdk/client-secrets-manager";
import winston, {createLogger} from "winston";

export type Stage = "dev" | "prod" | "local";

export type SecretName = "OncallSlackBot-serverless-prod" | "OncallSlackBot-serverless-test";

export const logger = createLogger( {
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console()
    ]
});

export const context = isLocal() ? createLocalContext() : isDev()? createDevContext() : createContext();

export interface Context {
    secretsManager : SecretsManager;
    secretName: SecretName;
}

function createContext(): Context {
    logger.info("Creating context for prod");
    return {
        secretsManager: new SecretsManager({}),
        secretName: "OncallSlackBot-serverless-prod"
    };
}

function createDevContext(): Context {
    logger.info("Creating context for dev");
    return {
        secretsManager: new SecretsManager({}),
        secretName: "OncallSlackBot-serverless-test"
    };
}

function isLocal(): boolean {
    return process.env.stage === "local";
}

function isDev(): boolean {
    return process.env.stage === "dev";
}

function createLocalContext(): Context {
    logger.info("Creating context for local");
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
        secretName: "OncallSlackBot-serverless-test"
    };
}

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
            else {
                let buff = new Buffer(data.SecretBinary!);
                return buff.toString('ascii');
            }
        }
    }
    catch (e) {
        console.log('Error retrieving secrets');
        console.log(e);
    }
    return undefined;
}