import {
    AwaitMessagesOptions,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    TextChannel,
} from "discord.js";

import { BugTicketModel } from "../models/BugTicketModel.js";
import { ChannelIdsModel } from "../models/ChannelIdsModel.js";

import { Input } from "../namespaces/Input.js";

import { Ticket } from "./Ticket.js";

/**
 * A ticket that is used to represent a bug ticket.
 */
export class BugTicket extends Ticket {
    async startReadProcess() {
        const awaitOptions: AwaitMessagesOptions = {
            filter: msg => msg.author.id === this.interaction.user.id,
            time: this.FIVE_MINUTES,
            errors: ["time"],
            max: 1,
        };

        const issue = (
            await Input.awaitMessage(this.interaction, {
                title: "Bug Ticket",
                description: "Please describe the bug that you identified.",
                color: "YELLOW",
                footer: { text: "You have five minutes to describe your issue." },
                awaitOptions,
            })
        ).first().content;

        const channelCount = await BugTicketModel.getCount();

        console.log(channelCount);

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("solve")
                .setLabel("Solve")
                .setEmoji("✅")
                .setStyle("SUCCESS")
        );

        const embed = new MessageEmbed()
            .setTitle(`Bug Ticket #${channelCount}`)
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
                    value: "Bug",
                },
            ])
            .setColor("BLUE");

        const channels = await this.interaction.guild.channels.fetch();
        const pendentChannelId = await ChannelIdsModel.getChannelId("bugChannelId");
        const pendentChannel = channels.get(pendentChannelId) as TextChannel;

        const message = await pendentChannel.send({ embeds: [embed], components: [row] });

        const questionTicket = new BugTicketModel({
            _id: channelCount,
            authorId: this.interaction.user.id,
            messageId: message.id,
            description: issue,
        });

        message.edit({
            content: `Bug sended to moderators with success.`,
        });
        questionTicket.save();
    }
}