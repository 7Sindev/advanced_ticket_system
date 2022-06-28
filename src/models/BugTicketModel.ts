import mongoose from "mongoose";
import autoIncrement from "mongoose-auto-increment";

import { IdentityCountersType } from "../@types/IdentityCountersType.js";
import { TicketType, StaticTicketMethods } from "../@types/TicketType.js";

export type BugTicketType = TicketType;

const bugTicketSchema = new mongoose.Schema<BugTicketType, StaticTicketMethods>({
    authorId: String,
    channelId: String,
    messageId: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
});

bugTicketSchema.plugin(autoIncrement.plugin, {
    model: "bug_tickets",
    field: "_id",
    startAt: 1,
});

bugTicketSchema.static("getCount", async function () {
    const counters = mongoose.connection.collection<IdentityCountersType>("identitycounters");
    const counter = (await counters.findOne({ model: "bug_tickets" })).count;

    return counter;
});

export const BugTicketModel = mongoose.model<BugTicketType, StaticTicketMethods>(
    "bug_tickets",
    bugTicketSchema
);