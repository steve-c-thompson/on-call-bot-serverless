import {ScheduleDataLoader} from "./ScheduleDataLoader";
import {ScheduleData} from "../model/ScheduleData";
import {GoogleSpreadsheet} from "google-spreadsheet";
import {SlackChannel} from "../model/SlackChannel";
import {TeamMember} from "../model/TeamMember";
import {ScheduleBlock} from "../model/ScheduleBlock";
import moment from "moment";
import {testPing} from "../utils/httputils";

export type GoogleSheetScheduleDataLoaderProps = {
    sheetId?: string;
    accountEmail: string;
    privateKey: string;
}

export class GoogleSheetScheduleDataLoader implements ScheduleDataLoader<ScheduleData> {
    sheetId: string;
    constructor(sheetId: string) {
        this.sheetId = sheetId;
    }

    private async initSheet(doc: GoogleSpreadsheet, accountEmail: string, privateKey: string) : Promise<GoogleSpreadsheet> {
        // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
        await doc.useServiceAccountAuth({
            client_email: accountEmail,
            private_key: privateKey,
        });
        await doc.loadInfo();
        console.log(doc.title + " loaded");

        return doc;
    }

    async init (props:GoogleSheetScheduleDataLoaderProps): Promise<ScheduleData> {
        console.log("Loading google sheet");
        console.log("Calling testPing");
        testPing();
        // console.log('####'+props.privateKey);
        const doc = new GoogleSpreadsheet(this.sheetId);
        const sheet = await this.initSheet(doc, props.accountEmail, props.privateKey);
        return await this.buildData(sheet);
    }

    private async buildData(sheet: GoogleSpreadsheet): Promise<ScheduleData>
    {
        let slackChannels : SlackChannel[] = [];

        await sheet.sheetsByTitle['Slack Data'].getRows()
            .then(rows => {
                rows.forEach(row => {
                    slackChannels.push(new SlackChannel(row.channel, row.id));
                });
            });

        let teamMembers: TeamMember[] = [];
        await sheet.sheetsByTitle['Team Data'].getRows()
            .then(rows => {
                rows.forEach(row => {
                    teamMembers.push(new TeamMember(row["Display Name"], row["Slack Member ID"], row.Email));
                });
            });

        let scheduleBlocks: ScheduleBlock[] = [];
        await sheet.sheetsByTitle['Schedule'].getRows()
            .then(rows => {

                rows.forEach(row => {
                    scheduleBlocks.push(new ScheduleBlock(
                        new Date(row["Date Start"]),
                        moment(new Date(row["Date End (inclusive)"])).endOf('day').toDate(),
                        Array.of(
                            teamMembers.filter(m => m.displayName == row["Final Primary"])[0],
                            teamMembers.filter(m => m.displayName == row["Final Secondary"])[0]))
                    );
                })
            });
        let messages: string[] = [];
        await sheet.sheetsByTitle['Slack Messages'].getRows()
            .then(rows => {
                rows.forEach(row => {
                    messages.push(row["Message"]);
                });
            });

        let flatData: Map<string, string> = new Map();
        await sheet.sheetsByTitle['Flat Data'].getRows()
            .then(rows => {
                rows.forEach(row => {
                    // row metadata starts with _
                    Object.keys(row).filter(k => !k.startsWith("_")).forEach(k => {
                        flatData.set(k, row[k]);
                    })
                });
            });
        return new ScheduleData(slackChannels, scheduleBlocks, teamMembers, messages, flatData);
    }
}