import {SlackChannel} from "./SlackChannel";
import {ScheduleBlock} from "./ScheduleBlock";
import {TeamMember} from "./TeamMember";

export class ScheduleData {
    slackChannels: SlackChannel[]
    scheduleBlocks: ScheduleBlock[]
    teamMembers: TeamMember[]
    slackMessages: string[]
    flatData: Map<string, string>

    constructor(slackChannels: SlackChannel[], scheduleBlocks: ScheduleBlock[], teamMembers: TeamMember[], slackMessages: string[], flatData:Map<string, string> = new Map()) {
        this.slackChannels = slackChannels;
        this.scheduleBlocks = scheduleBlocks;
        this.teamMembers = teamMembers;
        this.slackMessages = slackMessages;
        this.flatData = flatData;
    }
}