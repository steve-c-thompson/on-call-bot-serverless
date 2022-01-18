#!/usr/bin/env ts-node-script
import {
    CreateSecretCommand,
    ListSecretsCommand,
    SecretsManager, UpdateSecretCommand
} from "@aws-sdk/client-secrets-manager";
import * as AWS from "aws-sdk";
import {context} from "../../secrets/utils";

export async function createSecretsFromEnv() {
    const secretName = context.secretName;

    // create the secret string and stringify the google creds because they will be multiline
    const secretString = `{"SLACK_SIGNING_SECRET": "${process.env.SLACK_SIGNING_SECRET}" ,"SLACK_BOT_TOKEN": "${process.env.SLACK_BOT_TOKEN}","SLACK_GOOGLE_SHEET_ID": "${process.env.SLACK_GOOGLE_SHEET_ID}","GOOGLE_SERVICE_ACCOUNT_EMAIL": "${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}","GOOGLE_PRIVATE_KEY": ${JSON.stringify(process.env.GOOGLE_PRIVATE_KEY)}}`;

    const client = new SecretsManager({
        endpoint: "http://localhost:4566",
        credentials: {
            accessKeyId: AWS.config.credentials?.accessKeyId!,
            secretAccessKey: AWS.config.credentials?.secretAccessKey!
        },
        region: AWS.config.region,
    });

    // See if secret exists
    const listSecrets = new ListSecretsCommand({});
    const secrets = await client.send(listSecrets);

    const foundSecret = secrets.SecretList?.find(s => s.Name === secretName);
    let command : CreateSecretCommand | UpdateSecretCommand;
    if(foundSecret) {
        console.log("Updating secret " + secretName);
        command = new UpdateSecretCommand({
            SecretId: foundSecret.ARN,
            SecretString: secretString
        });
        const response = await client.send(command);
        console.log(response);
    }
    else {
        console.log("Creating new secret " + secretName);
        command = new CreateSecretCommand({
            Name: secretName,
            SecretString: secretString
        });
        const response = await client.send(command);
        console.log(response);
    }
}

if (require.main === module) {
    createSecretsFromEnv();
}