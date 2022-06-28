import mongoose from "mongoose";
import autoIncrement from "mongoose-auto-increment";

import { IdentityCountersType } from "../@types/IdentityCountersType";
import { TicketType, StaticTicketMethods } from "../@types/TicketType.js";

export type ReportTicketType = TicketType;

const reportTicketSchema = new mongoose.Schema<ReportTicketType, StaticTicketMethods>({
    authorId: String,
    channelId: String,
    messageId: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
});

reportTicketSchema.plugin(autoIncrement.plugin, {
    model: "report_tickets",
    field: "_id",
    startAt: 1,
});

reportTicketSchema.static("getCount", async function () {
    const counters = mongoose.connection.collection<IdentityCountersType>("identitycounters");
    const counter = (await counters.findOne({ model: "bug_tickets" })).count;

    return counter;
});

export const ReportTicketModel = mongoose.model<ReportTicketType, StaticTicketMethods>(
    "report_tickets",
    reportTicketSchema
);