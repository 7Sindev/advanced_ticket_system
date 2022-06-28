import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";

import { BugTicket } from "../classes/BugTicket.js";
import { QuestionTicket } from "../classes/QuestionTicket.js";
import { ReportTicket } from "../classes/ReportTicket.js";

import { BugTicketType } from "../models/BugTicketModel.js";
import { ReportTicketType } from "../models/ReportTicketModel.js";
import { QuestionTicketType } from "../models/QuestionTicketModel.js";

@Discord()
@SlashGroup({ name: "ticket", description: "Ticket commands" })
@SlashGroup("ticket")
class Ticket {
    @Slash("create")
    async create(
        @SlashChoice("question", "report", "bug")
        @SlashOption("type")
        type: "question" | "report" | "bug",

        interaction: CommandInteraction
    ) {
        const questionTicketCollection = interaction.client.database.collection<QuestionTicketType>("question_tickets");
        const reportTicketCollection = interaction.client.database.collection<ReportTicketType>("report_tickets");
        const bugTicketCollection = interaction.client.database.collection<BugTicketType>("bug_tickets");

        const hasTicketCreated = 
            !!await questionTicketCollection.findOne({ authorId: interaction.user.id }) ||
            !!await reportTicketCollection.findOne({ authorId: interaction.user.id }) ||
            !!await bugTicketCollection.findOne({ authorId: interaction.user.id });

        if (hasTicketCreated) {
            return interaction.reply("You already have a ticket pendent.");
        }

        const ticketTypes = {
            question: new QuestionTicket(interaction),
            report: new ReportTicket(interaction),
            bug: new BugTicket(interaction),
        };

        const ticket = ticketTypes[type];

        await ticket.startReadProcess();
    }
}