import mongoose from "mongoose";

export type IdentityCountersType = {
    _id: mongoose.Types.ObjectId;
    model: string;
    field: "_id";
    count: number;
};