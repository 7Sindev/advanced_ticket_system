import mongoose from "mongoose";
import autoIncrement from "mongoose-auto-increment";

import { IdentityCountersType } from "../@types/IdentityCountersType.js";
import { TicketType, StaticTicketMethods } from "../@types/TicketType.js";

export type QuestionTicketType = TicketType;

const questionTicketSchema = new mongoose.Schema<QuestionTicketType, StaticTicketMethods>(
    {
        authorId: String,
        channelId: String,
        messageId: String,
        description: String,
        createdAt: { type: Date, default: Date.now },
    }
);

questionTicketSchema.plugin(autoIncrement.plugin, {
    model: "question_tickets",
    field: "_id",
    startAt: 1,
});

questionTicketSchema.static("getCount", async function () {
    const counters = mongoose.connection.collection<IdentityCountersType>("identitycounters");
    const counter = (await counters.findOne({ model: "bug_tickets" })).count;

    return counter;
});

export const QuestionTicketModel = mongoose.model<
    QuestionTicketType,
    StaticTicketMethods
>("question_tickets", questionTicketSchema);