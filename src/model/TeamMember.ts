export class TeamMember {
    displayName: string
    slackMemberId: string
    email: string

    constructor(displayName: string, slackMemberId: string, email: string) {
        this.displayName = displayName;
        this.slackMemberId = slackMemberId;
        this.email = email;
    }
}