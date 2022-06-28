import {
    AwaitMessagesOptions,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextChannel,
} from "discord.js";

import { ChannelIdsModel } from "../models/ChannelIdsModel.js";
import { ReportTicketModel } from "../models/ReportTicketModel.js";

import { Input } from "../namespaces/Input.js";

import { Ticket } from "./Ticket.js";

/**
 * A ticket that is used to represent a report ticket.
 */
export class ReportTicket extends Ticket {
    async startReadProcess() {
        const awaitOptions: AwaitMessagesOptions = {
            filter: msg => msg.author.id === this.interaction.user.id,
            time: this.FIVE_MINUTES,
            errors: ["time"],
            max: 1,
        };

        const issue = (
            await Input.awaitMessage(this.interaction, {
                title: "Report Ticket",
                description: "Please describe the issue you are experiencing.",
                color: "RED",
                footer: { text: "You have five minutes to describe your issue." },
                awaitOptions,
            })
        ).first().content;

        const channelCount = await ReportTicketModel.getCount();

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId(`solve`)
                .setLabel("Solve")
                .setEmoji("✅")
                .setStyle("SUCCESS")
        );

        const embed = new MessageEmbed()
            .setTitle(`Report Ticket #${channelCount}`)
            .setDescription(issue)
            .setFields([
                {
                    name: "Status",
                    value: "Pending",
                    inline: true,
                },
                {
                    name: "Author",
                    value: `${this.interaction.user.tag} (${this.interaction.user.id})`,
                    inline: true,
                },
                {
                    name: "Created At",
                    value: this.interaction.createdAt.toLocaleString(),
                    inline: false,
                },
                {
                    name: "Type",
                    value: "Report",
                },
            ])
            .setColor("BLUE");

        const channels = await this.interaction.guild.channels.fetch();
        const pendentChannelId = await ChannelIdsModel.getChannelId("reportChannelId");
        const pendentChannel = channels.get(pendentChannelId) as TextChannel;

        const message = await pendentChannel.send({ embeds: [embed], components: [row] });

        const reportTicket = new ReportTicketModel({
            _id: channelCount,
            authorId: this.interaction.user.id,
            messageId: message.id,
            description: issue,
        });

        message.edit({
            content: `Report sended to moderators with success.`,
        });
        reportTicket.save();
    }
}