import {TeamMember} from "./TeamMember";

export class ScheduleBlock {
    readonly dateStart: Date
    readonly dateEnd: Date
    readonly onCallTeamMembers: TeamMember[]

    constructor(dateStart: Date, dateEnd: Date, onCallTeamMembers: TeamMember[]) {
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.onCallTeamMembers = onCallTeamMembers;
    }
}