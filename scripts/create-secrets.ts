#!/usr/bin/env ts-node-script
import {
    CreateSecretCommand,
    ListSecretsCommand,
    SecretsManagerClient, UpdateSecretCommand
} from "@aws-sdk/client-secrets-manager";

export async function createSecretsFromEnv() {
    console.log("Creating secrets...");

    const secretName = "OncallSlackBot-prod";
    const secretString = `[{"SLACK_SIGNING_SECRET": "${process.env.SLACK_SIGNING_SECRET}" ,"SLACK_BOT_TOKEN": "${process.env.SLACK_BOT_TOKEN}","GOOGLE_SHEET_ID": "${process.env.SLACK_GOOGLE_SHEET_ID}","GOOGLE_SERVICE_ACCOUNT_EMAIL": "${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}","GOOGLE_PRIVATE_KEY": "${process.env.GOOGLE_PRIVATE_KEY}"}]`;

    const client = new SecretsManagerClient({
        endpoint: "http://localhost:4566",
        credentials: {
            accessKeyId: "not-a-real-access-key-id",
            secretAccessKey: "not-a-real-access-key"
        },
        region: "us-west-2",
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