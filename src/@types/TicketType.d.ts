import mongoose from "mongoose";

export type TicketType = {
    _id: number;
    channelId: string;
    messageId: string;
    authorId: string;
    description: string;
    createdAt: Date;
};

export type StaticTicketMethods = mongoose.Model<TicketType> & {
    getCount(): Promise<number>;
};