export class SlackChannel {
    channelName: string
    channelId: string

    constructor(channelName: string, channelId: string) {
        this.channelName = channelName;
        this.channelId = channelId;
    }
}