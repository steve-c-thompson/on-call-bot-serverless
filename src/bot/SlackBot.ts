import {ScheduleData} from "../model/ScheduleData";
import moment from "moment";
import {TextUtils} from "../utils/textutils";
import {ScheduleBlock} from "../model/ScheduleBlock";

export class SlackBot {
    private readonly INPUT_DATE_FORMAT = "M/D/YYYY";
    private readonly OUTPUT_DATE_FORMAT = "M/D";
    private readonly PERIOD_START_TOKEN = "${period_start}";
    private readonly PERIOD_END_TOKEN = "${period_end}";
    private readonly MAX_SCHEDULE_ROWS = 3;
    scheduleData: ScheduleData;
    constructor(scheduleData: ScheduleData) {
        this.scheduleData = scheduleData;
    }

    async refresh(scheduleData:ScheduleData){
        this.scheduleData = scheduleData;
    }

    async handleNowRequest(): Promise<string> {
        return this.buildNowMessage() + this.buildResources();
    }

    async handleScheduleRequest(atUsers = false): Promise<string> {
        return this.buildScheduleMessage(atUsers) + this.buildResources();
    }

    async handleReminderRequest(atUsers = false): Promise<string> {
        return this.buildNowMessage() + this.buildScheduleMessage(true) + this.buildResources();
    }

    getSlackChannelIds(): string[] {
        return this.scheduleData.slackChannels.map(sc => sc.channelId);
    }

    private buildResources() {
        let r = this.scheduleData.flatData.get("resources");
        return r ? r + "\n" : "";
    }
    private buildNowMessage(): string{
        let msg = this.scheduleData.slackMessages[Math.floor(Math.random()*this.scheduleData.slackMessages.length)]

        // get users for dates in range
        const now = moment();
        let schedule = this.scheduleData.scheduleBlocks.find(block => {
            let mStart = moment(block.dateStart, this.INPUT_DATE_FORMAT);
            let mEnd = moment(block.dateEnd, this.INPUT_DATE_FORMAT);
            return now.isBetween(mStart , mEnd, undefined,"[]");
        });
        // if no user data is returned, respond with message that no user found for current date
        if(!schedule) {
            msg = "No users are active for the current date";
        }
        else {
            // sub dates into message
            const dateData = new Map<string, Date>();
            dateData.set(this.PERIOD_START_TOKEN, schedule.dateStart);
            dateData.set(this.PERIOD_END_TOKEN, schedule.dateEnd);
            msg = TextUtils.doDateSubstitution(msg, dateData, this.OUTPUT_DATE_FORMAT);

            // @ users
            const userData = this.findUserSlackIds(schedule);
            let userList = userData.map(x => this.formatAtUser(x)).join(" ");
            msg = userList + " " + msg;
        }
        return msg + "\n";
    }

    private findUserSlackIds(scheduleBlock:ScheduleBlock): string[]{
        // find user data based on the current date
        return scheduleBlock.onCallTeamMembers.map(m => {
            return m.slackMemberId;
        });
    }
    private formatAtUser(id: string) {
        return "<@" + id + ">";
    }


    private buildScheduleMessage(atUsers=false): string {
        let msg = "No schedule available at this time";
        const now = moment();
        // find the first startDate "now" is after
        let scheduleIndex = this.scheduleData.scheduleBlocks.findIndex(block => {
            let mStart = moment(block.dateStart, this.INPUT_DATE_FORMAT);
            return now.isSameOrAfter(mStart);
        });
        if(scheduleIndex >= 0) {
            // now find the next rows
            let schedules:ScheduleBlock[] = this.scheduleData.scheduleBlocks
                .slice(scheduleIndex)
                .filter((block) => {
                    let mEnd = moment(block.dateEnd, this.INPUT_DATE_FORMAT);
                    return now.isSameOrBefore(mEnd);
            });
            schedules = schedules.slice(0, schedules.length < this.MAX_SCHEDULE_ROWS ? schedules.length : this.MAX_SCHEDULE_ROWS);

            msg = "On-Call Schedule:\n"
            schedules.forEach(el => {
               msg += moment(el.dateStart).format(this.OUTPUT_DATE_FORMAT) + " - " + moment(el.dateEnd).format(this.OUTPUT_DATE_FORMAT)
                    + " " + el.onCallTeamMembers.map(m => {
                        return m.displayName + (atUsers ? " (" + this.formatAtUser(m.slackMemberId) + ")": "");
                    }).join(", ")
                   + "\n";

            });
        }
        return msg;
    }

}
