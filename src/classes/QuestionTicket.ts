import {
    AwaitMessagesOptions,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextChannel,
} from "discord.js";

import { ChannelIdsModel } from "../models/ChannelIdsModel.js";
import { QuestionTicketModel } from "../models/QuestionTicketModel.js";

import { Input } from "../namespaces/Input.js";

import { Ticket } from "./Ticket.js";


/**
 * A ticket that is used to represent a question ticket.
 */
export class QuestionTicket extends Ticket {
    async startReadProcess() {
        const awaitOptions: AwaitMessagesOptions = {
            filter: msg => msg.author.id === this.interaction.user.id,
            time: this.FIVE_MINUTES,
            errors: ["time"],
            max: 1,
        };

        const issue = (
            await Input.awaitMessage(this.interaction, {
                title: "Question Ticket",
                description: "Please describe your question.",
                color: "BLUE",
                footer: { text: "You have five minutes to describe your question." },
                awaitOptions,
            })
        ).first().content;

        const channelCount = await QuestionTicketModel.getCount();

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("solve")
                .setLabel("Solve")
                .setEmoji("✅")
                .setStyle("SUCCESS")
        );

        const embed = new MessageEmbed()
            .setTitle(`Question Ticket #${channelCount}`)
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
                    value: "Question",
                },
            ])
            .setColor("BLUE");

        const channels = await this.interaction.guild.channels.fetch();
        const pendentChannelId = await ChannelIdsModel.getChannelId("questionChannelId");
        const pendentChannel = channels.get(pendentChannelId) as TextChannel;

        const message = await pendentChannel.send({ embeds: [embed], components: [row] });

        const questionTicket = new QuestionTicketModel({
            _id: channelCount,
            authorId: this.interaction.user.id,
            messageId: message.id,
            description: issue,
        });

        message.edit({
            content: `Question sended to moderators with success.`,
        });
        questionTicket.save();
    }
}