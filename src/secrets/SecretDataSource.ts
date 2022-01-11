export interface SecretDataSource {
    slackBotToken() : Promise<string>,
    signingSecret() : Promise<string>,
    googleSheetId() : Promise<string>,
    googleServiceAccountEmail(): Promise<string>,
    googlePrivateKey(): Promise<string>,
}

export interface OncallSecret {
    GOOGLE_PRIVATE_KEY: string
    GOOGLE_SERVICE_ACCOUNT_EMAIL: string
    SLACK_SIGNING_SECRET: string
    SLACK_BOT_TOKEN: string
    SLACK_GOOGLE_SHEET_ID: string
}