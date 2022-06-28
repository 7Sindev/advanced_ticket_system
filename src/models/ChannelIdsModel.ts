import mongoose from "mongoose";

export type PendentChannelIdsType = {
    bugChannelId: string;
    questionChannelId: string;
    reportChannelId: string;
    transcriptChannelId: string;
};

export type StaticPendentChannelIdsMethods = mongoose.Model<PendentChannelIdsType> & {
    getChannelId(id: keyof PendentChannelIdsType): Promise<string>;
};

const channelIdsSchema = new mongoose.Schema<
    PendentChannelIdsType,
    StaticPendentChannelIdsMethods
>({
    bugChannelId: String,
    questionChannelId: String,
    reportChannelId: String,
    transcriptChannelId: String,
});

channelIdsSchema.static("getChannelId", async function (id: keyof PendentChannelIdsType) {
    return (await this.find({}))[0][id];
});

export const ChannelIdsModel = mongoose.model<
    PendentChannelIdsType,
    StaticPendentChannelIdsMethods
>("channel_ids", channelIdsSchema);