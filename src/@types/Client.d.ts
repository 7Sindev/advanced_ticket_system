import { Client } from "discord.js";
import mongoose from "mongoose";

declare module "discord.js" {
    export interface Client {
        database: mongoose.Connection;
    }
}