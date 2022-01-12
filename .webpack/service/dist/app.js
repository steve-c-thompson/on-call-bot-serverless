/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./dist/app.js":
/*!*********************!*\
  !*** ./dist/app.js ***!
  \*********************/
/***/ ((module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst bolt_1 = __webpack_require__(/*! @slack/bolt */ \"@slack/bolt\");\nconst SlackBot_1 = __webpack_require__(/*! ./bot/SlackBot */ \"./dist/bot/SlackBot.js\");\nconst GoogleSheetScheduleDataLoader_1 = __webpack_require__(/*! ./data/GoogleSheetScheduleDataLoader */ \"./dist/data/GoogleSheetScheduleDataLoader.js\");\nconst AwsSecretsDataSource_1 = __webpack_require__(/*! ./secrets/AwsSecretsDataSource */ \"./dist/secrets/AwsSecretsDataSource.js\");\nconst utils_1 = __webpack_require__(/*! ./secrets/utils */ \"./dist/secrets/utils.js\");\n(__webpack_require__(/*! dotenv */ \"dotenv\").config)({ path: __webpack_require__(/*! find-config */ \"find-config\")('.env') });\nlet boltApp;\n// const dataSource = new EnvSecretDataSource();\nconst dataSource = new AwsSecretsDataSource_1.AwsSecretsDataSource(utils_1.context.secretsManager);\n// Initialize by executing async function on startup. This is due to promised being returned from the dataSource, and\n// needing to wait for those in ctors.\n(async () => {\n    receiver = new bolt_1.AwsLambdaReceiver({\n        signingSecret: await dataSource.signingSecret(),\n    });\n    boltApp = new bolt_1.App({\n        token: await dataSource.slackBotToken(),\n        signingSecret: await dataSource.signingSecret(),\n        receiver: receiver,\n        // processBeforeResponse: true\n    });\n    boltApp.command(\"/oncall\", async ({ command, ack, respond }) => {\n        // Acknowledge command request\n        await ack();\n        let args = command.text;\n        if (!args) {\n            args = \"schedule\";\n        }\n        let message;\n        let response_type = \"ephemeral\";\n        let attachments = [];\n        switch (args) {\n            case \"refresh\":\n                // do not await this refresh because the response could time out\n                asyncDataRefresh(slackBot, dataLoaderSheet);\n                message = \"Schedule refreshed from data\";\n                break;\n            case \"now\":\n                message = await slackBot.handleNowRequest();\n                response_type = \"in_channel\";\n                break;\n            case \"post schedule\":\n                response_type = \"in_channel\";\n            // fall through\n            case \"schedule\":\n                message = await slackBot.handleScheduleRequest();\n                break;\n            case \"help\":\n                message = \"How to use /oncall\";\n                attachments.push({ \"text\": \"'/oncall now' to see who is on call right now.\"\n                        + \"\\n'/oncall schedule' to see the next few weeks of schedule\"\n                        + \"\\n'/oncall post schedule' to post the next few weeks of schedule\"\n                        + \"\\n'/oncall refresh' to refresh data from the spreadsheet\" });\n                break;\n            default:\n                message = \"Command not recognized. Use '/oncall help' for more information.\";\n        }\n        // cast response_type since it is constrained\n        await respond({\n            response_type: response_type,\n            text: message,\n            attachments: attachments\n        });\n    });\n})();\nlet receiver;\nlet slackBot;\nlet dataLoaderSheet;\n// Handle the Lambda function event\nmodule.exports.handler = async (event, context, callback) => {\n    await init();\n    const handler = await receiver.start();\n    return handler(event, context, callback);\n};\n/**\n * Init function to load the sheet data and create a new slackBot\n * Runs only if a slackBot has not been created.\n */\nasync function init() {\n    if (!slackBot) {\n        const googleSheetId = await dataSource.googleSheetId();\n        console.log(\"SLACK_GOOGLE_SHEET_ID: \" + googleSheetId);\n        dataLoaderSheet = new GoogleSheetScheduleDataLoader_1.GoogleSheetScheduleDataLoader(googleSheetId);\n        const scheduleData = await loadSheet(dataLoaderSheet);\n        slackBot = new SlackBot_1.SlackBot(scheduleData);\n    }\n}\nasync function asyncDataRefresh(slackBot, dataLoaderSheet) {\n    const scheduleData = await loadSheet(dataLoaderSheet);\n    await slackBot.refresh(scheduleData);\n}\nfunction writeToChannels(message, res) {\n    // write to channels - be sure to add the bot to the channels or this will fail\n    const ids = slackBot.getSlackChannelIds();\n    let requests = ids.map(id => {\n        return new Promise((resolve, reject) => {\n            boltApp.client.chat.postMessage({\n                channel: id,\n                text: message\n            }).then(result => {\n                if (result.error) {\n                    reject(result.error);\n                }\n                else {\n                    resolve(result.message);\n                }\n            }).catch(e => {\n                reject(e);\n            });\n        });\n    });\n    Promise.all(requests)\n        .then(() => {\n        res.send(\"Success\");\n    })\n        .catch(err => {\n        console.log(err);\n        res.send(\"Error in call - check the logs\");\n        return err;\n    });\n}\n// receiver.router.post(\"/oncall-now\", (req, res) => {\n//     // write to channels - be sure to add the bot to the channels or this will fail\n//     slackBot.handleNowRequest().then(msg => {\n//         writeToChannels(msg, res);\n//     }).catch((e: Error) => {\n//         res.send(\"Error in call - check the logs\");\n//         console.log(e);\n//     })\n// });\nasync function loadSheet(dataLoaderSheet) {\n    return dataLoaderSheet.init({\n        accountEmail: await dataSource.googleServiceAccountEmail(),\n        privateKey: await dataSource.googlePrivateKey()\n    });\n}\n//# sourceMappingURL=app.js.map\n\n//# sourceURL=webpack://on-call-bot-serverless/./dist/app.js?");

/***/ }),

/***/ "./dist/bot/SlackBot.js":
/*!******************************!*\
  !*** ./dist/bot/SlackBot.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.SlackBot = void 0;\nconst moment_1 = __importDefault(__webpack_require__(/*! moment */ \"moment\"));\nconst textutils_1 = __webpack_require__(/*! ../utils/textutils */ \"./dist/utils/textutils.js\");\nclass SlackBot {\n    constructor(scheduleData) {\n        this.INPUT_DATE_FORMAT = \"M/D/YYYY\";\n        this.OUTPUT_DATE_FORMAT = \"M/D\";\n        this.PERIOD_START_TOKEN = \"${period_start}\";\n        this.PERIOD_END_TOKEN = \"${period_end}\";\n        this.MAX_SCHEDULE_ROWS = 3;\n        this.scheduleData = scheduleData;\n    }\n    async refresh(scheduleData) {\n        this.scheduleData = scheduleData;\n    }\n    async handleNowRequest() {\n        return this.buildNowMessage();\n    }\n    async handleScheduleRequest() {\n        return this.buildScheduleMessage();\n    }\n    getSlackChannelIds() {\n        return this.scheduleData.slackChannels.map(sc => sc.channelId);\n    }\n    buildResources() {\n        let r = this.scheduleData.flatData.get(\"resources\");\n        return r ? \"\\n\" + r + \"\\n\" : \"\";\n    }\n    buildNowMessage() {\n        let msg = this.scheduleData.slackMessages[Math.floor(Math.random() * this.scheduleData.slackMessages.length)];\n        // get users for dates in range\n        const now = moment_1.default();\n        let schedule = this.scheduleData.scheduleBlocks.find(block => {\n            let mStart = moment_1.default(block.dateStart, this.INPUT_DATE_FORMAT);\n            let mEnd = moment_1.default(block.dateEnd, this.INPUT_DATE_FORMAT);\n            return now.isBetween(mStart, mEnd, undefined, \"[]\");\n        });\n        // if no user data is returned, respond with message that no user found for current date\n        if (!schedule) {\n            msg = \"No users are active for the current date\";\n        }\n        else {\n            // sub dates into message\n            const dateData = new Map();\n            dateData.set(this.PERIOD_START_TOKEN, schedule.dateStart);\n            dateData.set(this.PERIOD_END_TOKEN, schedule.dateEnd);\n            msg = textutils_1.TextUtils.doDateSubstitution(msg, dateData, this.OUTPUT_DATE_FORMAT);\n            // @ users\n            const userData = this.findUserSlackIds(schedule);\n            let userList = userData.map(x => \"<@\" + x + \">\").join(\" \");\n            msg = userList + \" \" + msg;\n        }\n        return msg + this.buildResources();\n    }\n    findUserSlackIds(scheduleBlock) {\n        // find user data based on the current date\n        return scheduleBlock.onCallTeamMembers.map(m => {\n            return m.slackMemberId;\n        });\n    }\n    buildScheduleMessage() {\n        let msg = \"No schedule available at this time\";\n        const now = moment_1.default();\n        // find the first startDate \"now\" is after\n        let scheduleIndex = this.scheduleData.scheduleBlocks.findIndex(block => {\n            let mStart = moment_1.default(block.dateStart, this.INPUT_DATE_FORMAT);\n            return now.isSameOrAfter(mStart);\n        });\n        if (scheduleIndex >= 0) {\n            // now find the next rows\n            let schedules = this.scheduleData.scheduleBlocks\n                .slice(scheduleIndex)\n                .filter((block) => {\n                let mEnd = moment_1.default(block.dateEnd, this.INPUT_DATE_FORMAT);\n                return now.isSameOrBefore(mEnd);\n            });\n            schedules = schedules.slice(0, schedules.length < this.MAX_SCHEDULE_ROWS ? schedules.length : this.MAX_SCHEDULE_ROWS);\n            msg = \"Upcoming schedule:\\n\";\n            schedules.forEach(el => {\n                msg += moment_1.default(el.dateStart).format(this.OUTPUT_DATE_FORMAT) + \" - \" + moment_1.default(el.dateEnd).format(this.OUTPUT_DATE_FORMAT)\n                    + \" \" + el.onCallTeamMembers.map(m => { return m.displayName; }).join(\", \")\n                    + \"\\n\";\n            });\n        }\n        return msg + this.buildResources();\n    }\n}\nexports.SlackBot = SlackBot;\n//# sourceMappingURL=SlackBot.js.map\n\n//# sourceURL=webpack://on-call-bot-serverless/./dist/bot/SlackBot.js?");

/***/ }),

/***/ "./dist/data/GoogleSheetScheduleDataLoader.js":
/*!****************************************************!*\
  !*** ./dist/data/GoogleSheetScheduleDataLoader.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.GoogleSheetScheduleDataLoader = void 0;\nconst ScheduleData_1 = __webpack_require__(/*! ../model/ScheduleData */ \"./dist/model/ScheduleData.js\");\nconst google_spreadsheet_1 = __webpack_require__(/*! google-spreadsheet */ \"google-spreadsheet\");\nconst SlackChannel_1 = __webpack_require__(/*! ../model/SlackChannel */ \"./dist/model/SlackChannel.js\");\nconst TeamMember_1 = __webpack_require__(/*! ../model/TeamMember */ \"./dist/model/TeamMember.js\");\nconst ScheduleBlock_1 = __webpack_require__(/*! ../model/ScheduleBlock */ \"./dist/model/ScheduleBlock.js\");\nconst moment_1 = __importDefault(__webpack_require__(/*! moment */ \"moment\"));\nclass GoogleSheetScheduleDataLoader {\n    constructor(sheetId) {\n        this.sheetId = sheetId;\n    }\n    async initSheet(doc, accountEmail, privateKey) {\n        // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication\n        await doc.useServiceAccountAuth({\n            client_email: accountEmail,\n            private_key: privateKey,\n        });\n        await doc.loadInfo();\n        console.log(doc.title + \" loaded\");\n        return doc;\n    }\n    async init(props) {\n        const doc = new google_spreadsheet_1.GoogleSpreadsheet(this.sheetId);\n        const sheet = await this.initSheet(doc, props.accountEmail, props.privateKey);\n        return await this.buildData(sheet);\n    }\n    async buildData(sheet) {\n        let slackChannels = [];\n        await sheet.sheetsByTitle['Slack Data'].getRows()\n            .then(rows => {\n            rows.forEach(row => {\n                slackChannels.push(new SlackChannel_1.SlackChannel(row.channel, row.id));\n            });\n        });\n        let teamMembers = [];\n        await sheet.sheetsByTitle['Team Data'].getRows()\n            .then(rows => {\n            rows.forEach(row => {\n                teamMembers.push(new TeamMember_1.TeamMember(row[\"Display Name\"], row[\"Slack Member ID\"], row.Email));\n            });\n        });\n        let scheduleBlocks = [];\n        await sheet.sheetsByTitle['Schedule'].getRows()\n            .then(rows => {\n            rows.forEach(row => {\n                scheduleBlocks.push(new ScheduleBlock_1.ScheduleBlock(new Date(row[\"Date Start\"]), moment_1.default(new Date(row[\"Date End (inclusive)\"])).endOf('day').toDate(), Array.of(teamMembers.filter(m => m.displayName == row[\"Final Primary\"])[0], teamMembers.filter(m => m.displayName == row[\"Final Secondary\"])[0])));\n            });\n        });\n        let messages = [];\n        await sheet.sheetsByTitle['Slack Messages'].getRows()\n            .then(rows => {\n            rows.forEach(row => {\n                messages.push(row[\"Message\"]);\n            });\n        });\n        let flatData = new Map();\n        await sheet.sheetsByTitle['Flat Data'].getRows()\n            .then(rows => {\n            rows.forEach(row => {\n                // row metadata starts with _\n                Object.keys(row).filter(k => !k.startsWith(\"_\")).forEach(k => {\n                    flatData.set(k, row[k]);\n                });\n            });\n        });\n        return new ScheduleData_1.ScheduleData(slackChannels, scheduleBlocks, teamMembers, messages, flatData);\n    }\n}\nexports.GoogleSheetScheduleDataLoader = GoogleSheetScheduleDataLoader;\n//# sourceMappingURL=GoogleSheetScheduleDataLoader.js.map\n\n//# sourceURL=webpack://on-call-bot-serverless/./dist/data/GoogleSheetScheduleDataLoader.js?");

/***/ }),

/***/ "./dist/model/ScheduleBlock.js":
/*!*************************************!*\
  !*** ./dist/model/ScheduleBlock.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.ScheduleBlock = void 0;\nclass ScheduleBlock {\n    constructor(dateStart, dateEnd, onCallTeamMembers) {\n        this.dateStart = dateStart;\n        this.dateEnd = dateEnd;\n        this.onCallTeamMembers = onCallTeamMembers;\n    }\n}\nexports.ScheduleBlock = ScheduleBlock;\n//# sourceMappingURL=ScheduleBlock.js.map\n\n//# sourceURL=webpack://on-call-bot-serverless/./dist/model/ScheduleBlock.js?");

/***/ }),

/***/ "./dist/model/ScheduleData.js":
/*!************************************!*\
  !*** ./dist/model/ScheduleData.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.ScheduleData = void 0;\nclass ScheduleData {\n    constructor(slackChannels, scheduleBlocks, teamMembers, slackMessages, flatData = new Map()) {\n        this.slackChannels = slackChannels;\n        this.scheduleBlocks = scheduleBlocks;\n        this.teamMembers = teamMembers;\n        this.slackMessages = slackMessages;\n        this.flatData = flatData;\n    }\n}\nexports.ScheduleData = ScheduleData;\n//# sourceMappingURL=ScheduleData.js.map\n\n//# sourceURL=webpack://on-call-bot-serverless/./dist/model/ScheduleData.js?");

/***/ }),

/***/ "./dist/model/SlackChannel.js":
/*!************************************!*\
  !*** ./dist/model/SlackChannel.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.SlackChannel = void 0;\nclass SlackChannel {\n    constructor(channelName, channelId) {\n        this.channelName = channelName;\n        this.channelId = channelId;\n    }\n}\nexports.SlackChannel = SlackChannel;\n//# sourceMappingURL=SlackChannel.js.map\n\n//# sourceURL=webpack://on-call-bot-serverless/./dist/model/SlackChannel.js?");

/***/ }),

/***/ "./dist/model/TeamMember.js":
/*!**********************************!*\
  !*** ./dist/model/TeamMember.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.TeamMember = void 0;\nclass TeamMember {\n    constructor(displayName, slackMemberId, email) {\n        this.displayName = displayName;\n        this.slackMemberId = slackMemberId;\n        this.email = email;\n    }\n}\nexports.TeamMember = TeamMember;\n//# sourceMappingURL=TeamMember.js.map\n\n//# sourceURL=webpack://on-call-bot-serverless/./dist/model/TeamMember.js?");

/***/ }),

/***/ "./dist/secrets/AwsSecretsDataSource.js":
/*!**********************************************!*\
  !*** ./dist/secrets/AwsSecretsDataSource.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.AwsSecretsDataSource = void 0;\nconst utils_1 = __webpack_require__(/*! ./utils */ \"./dist/secrets/utils.js\");\nclass AwsSecretsDataSource {\n    constructor(sm) {\n        this.secretsManager = sm;\n    }\n    async buildSecretPromise(secretToken) {\n        return new Promise((resolve, reject) => {\n            let sp = utils_1.getSecretValue(this.secretsManager, utils_1.awsInfo.getSecretName());\n            sp.then((sec) => {\n                if (sec) {\n                    // Ugly casting to get the secret into correct format\n                    const secCast = sec;\n                    const val = secCast[secretToken];\n                    resolve(val);\n                }\n                else {\n                    reject(`Secret ${secretToken} not found`);\n                }\n            }).catch((reason) => {\n                console.log(`Error fetching ${secretToken}: `, reason);\n                reject(reason);\n            });\n        });\n    }\n    googlePrivateKey() {\n        return this.buildSecretPromise(\"GOOGLE_PRIVATE_KEY\");\n    }\n    googleServiceAccountEmail() {\n        return this.buildSecretPromise(\"GOOGLE_SERVICE_ACCOUNT_EMAIL\");\n    }\n    signingSecret() {\n        return this.buildSecretPromise(\"SLACK_SIGNING_SECRET\");\n    }\n    slackBotToken() {\n        return this.buildSecretPromise(\"SLACK_BOT_TOKEN\");\n    }\n    googleSheetId() {\n        return this.buildSecretPromise(\"SLACK_GOOGLE_SHEET_ID\");\n    }\n}\nexports.AwsSecretsDataSource = AwsSecretsDataSource;\n//# sourceMappingURL=AwsSecretsDataSource.js.map\n\n//# sourceURL=webpack://on-call-bot-serverless/./dist/secrets/AwsSecretsDataSource.js?");

/***/ }),

/***/ "./dist/secrets/utils.js":
/*!*******************************!*\
  !*** ./dist/secrets/utils.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getSecretValue = exports.awsInfo = exports.context = void 0;\nconst AWS = __importStar(__webpack_require__(/*! aws-sdk */ \"aws-sdk\"));\nconst client_secrets_manager_1 = __webpack_require__(/*! @aws-sdk/client-secrets-manager */ \"@aws-sdk/client-secrets-manager\");\nexports.context = isLocal() ? createLocalContext() : isDev() ? createDevContext() : createContext();\nfunction createContext() {\n    return {\n        secretsManager: new client_secrets_manager_1.SecretsManager({}),\n        secretName: \"OncallSlackBot-serverless-prod\"\n    };\n}\nfunction createDevContext() {\n    return {\n        secretsManager: new client_secrets_manager_1.SecretsManager({}),\n        secretName: \"OncallSlackBot-serverless-test\"\n    };\n}\nfunction isLocal() {\n    return process.env.NODE_ENV === \"local\";\n}\nfunction isDev() {\n    return process.env.NODE_ENV === \"dev\";\n}\nfunction createLocalContext() {\n    AWS.config.update({\n        accessKeyId: \"not-a-real-access-key-id\",\n        secretAccessKey: \"not-a-real-access-key\",\n        region: \"us-west-2\",\n        // Uncomment to see localstack calls in the console\n        // logger: console,\n    });\n    return {\n        secretsManager: new client_secrets_manager_1.SecretsManager({\n            endpoint: \"http://localhost:4566\",\n            credentials: {\n                accessKeyId: AWS.config.credentials?.accessKeyId,\n                secretAccessKey: AWS.config.credentials?.secretAccessKey\n            },\n            region: AWS.config.region,\n        }),\n        secretName: \"OncallSlackBot-serverless-test\"\n    };\n}\nclass AwsInfo {\n    getAccountNumber() {\n        return process.env.CDK_DEFAULT_ACCOUNT || \"146543024844\";\n    }\n    getRegion() {\n        return process.env.CDK_DEFAULT_REGION || \"us-east-2\";\n    }\n    getSecretName() {\n        return exports.context.secretName;\n    }\n}\nexports.awsInfo = new AwsInfo();\nasync function getSecretValue(sm, secretName) {\n    try {\n        const data = await sm.getSecretValue(({\n            SecretId: secretName\n        }));\n        if (data) {\n            if (data.SecretString) {\n                const secret = data.SecretString;\n                const parsedSecret = JSON.parse(secret);\n                return parsedSecret;\n            }\n            else {\n                let buff = new Buffer(data.SecretBinary);\n                return buff.toString('ascii');\n            }\n        }\n    }\n    catch (e) {\n        console.log('Error retrieving secrets');\n        console.log(e);\n    }\n    return undefined;\n}\nexports.getSecretValue = getSecretValue;\n//# sourceMappingURL=utils.js.map\n\n//# sourceURL=webpack://on-call-bot-serverless/./dist/secrets/utils.js?");

/***/ }),

/***/ "./dist/utils/textutils.js":
/*!*********************************!*\
  !*** ./dist/utils/textutils.js ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.TextUtils = void 0;\nconst moment_1 = __importDefault(__webpack_require__(/*! moment */ \"moment\"));\nvar TextUtils;\n(function (TextUtils) {\n    function doDateSubstitution(inputText, keysAndDates, formatString = \"M/D\") {\n        if (!keysAndDates.size) {\n            return inputText;\n        }\n        keysAndDates.forEach((value, key) => {\n            let transformedDate = moment_1.default(value).format(formatString);\n            inputText = inputText.replace(key, transformedDate);\n        });\n        return inputText;\n    }\n    TextUtils.doDateSubstitution = doDateSubstitution;\n})(TextUtils = exports.TextUtils || (exports.TextUtils = {}));\n//# sourceMappingURL=textutils.js.map\n\n//# sourceURL=webpack://on-call-bot-serverless/./dist/utils/textutils.js?");

/***/ }),

/***/ "@aws-sdk/client-secrets-manager":
/*!**************************************************!*\
  !*** external "@aws-sdk/client-secrets-manager" ***!
  \**************************************************/
/***/ ((module) => {

module.exports = require("@aws-sdk/client-secrets-manager");

/***/ }),

/***/ "@slack/bolt":
/*!******************************!*\
  !*** external "@slack/bolt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@slack/bolt");

/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ "find-config":
/*!******************************!*\
  !*** external "find-config" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("find-config");

/***/ }),

/***/ "google-spreadsheet":
/*!*************************************!*\
  !*** external "google-spreadsheet" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("google-spreadsheet");

/***/ }),

/***/ "moment":
/*!*************************!*\
  !*** external "moment" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("moment");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./dist/app.js");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;