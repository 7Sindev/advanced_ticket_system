import {
    CategoryChannel,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    Message,
    TextChannel,
    MessageAttachment
} from "discord.js";
import { Client, Discord, On } from "discordx";
import type { ArgsOf } from "discordx";

import { generateFromMessages } from "discord-html-transcripts";

import { PostsType } from "../@types/PostsType.js";
import { ChannelIdsModel } from "../models/ChannelIdsModel.js";

@Discord()
export class Example {
    @On("interactionCreate")
    async onSolveButtonClick([interaction]: ArgsOf<"interactionCreate">, client: Client) {
        if (interaction.isButton()) {
            if (interaction.customId === "solve") {
                const embed = interaction.message.embeds[0];
                const count = +embed.title.substring(embed.title.lastIndexOf("#") + 1);
                const type = embed.fields[3].value;

                const members = await interaction.guild.members.fetch();
                const collection = interaction.client.database.collection<PostsType>(
                    `${type.toLowerCase()}_tickets`
                );
                const post = await collection.findOne({ _id: count });
                const author = members.find(member => member.id === post.authorId);

                if (!author) {
                    return interaction.reply({ content: "Could not find author.", ephemeral: true });
                }

                const onChannelCreatedRow = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId(`ticket-close`)
                        .setLabel("Close")
                        .setEmoji("❌")
                        .setStyle("DANGER")
                );
                const onChannelCreateEmbed = new MessageEmbed()
                    .setTitle(`${type} Ticket #${count}`)
                    .setDescription(
                        `After the resolution of this ticket, this ticket will be deleted.`
                    )
                    .setColor("GREEN");

                const channels = await interaction.guild.channels.fetch();
                let category = channels.find(
                    channel =>
                        channel.type === "GUILD_CATEGORY" &&
                        channel.name === `${type}-Tickets`
                ) as CategoryChannel;

                if (!category) {
                    category = await interaction.guild.channels.create(
                        `${type}-Tickets`,
                        {
                            type: "GUILD_CATEGORY",
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.id,
                                    deny: [
                                        "VIEW_CHANNEL",
                                        "SEND_MESSAGES",
                                        "ADD_REACTIONS",
                                    ],
                                }
                            ],
                        }
                    );
                }

                const channel = await interaction.guild.channels.create(
                    `ticket-${count}`,
                    {
                        type: "GUILD_TEXT",
                        permissionOverwrites: [
                            {
                                id: author.id,
                                allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"],
                            },
                            {
                                id: interaction.user.id,
                                allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"],
                                deny: ["MANAGE_MESSAGES"],
                            },
                            {
                                id: interaction.guild.id,
                                deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"],
                            },
                        ],
                        parent: category,
                    }
                );

                await channel.send({
                    embeds: [onChannelCreateEmbed],
                    components: [onChannelCreatedRow],
                });

                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("solve")
                        .setLabel("Solve")
                        .setEmoji("✅")
                        .setStyle("SUCCESS")
                        .setDisabled(true)
                );
                interaction.message.embeds[0].fields[0] = {
                    name: "Status",
                    value: "Being solved",
                    inline: true
                }

                interaction.message = interaction.message as Message;

                interaction.message.edit({
                    embeds: interaction.message.embeds,
                    components: [row],
                });
            }
        }
    }

    @On("interactionCreate")
    async onCloseButtonClick([interaction]: ArgsOf<"interactionCreate">, client: Client) {
        if (interaction.isButton()) {
            if (interaction.customId === "ticket-close") {
                const channels = await interaction.guild.channels.fetch();
                
                // Get count and type from embed, identifying which ticket it is
                const embed = interaction.message.embeds[0];
                const count = +embed.title.substring(embed.title.lastIndexOf("#") + 1);
                let type = embed.title.substring(0, embed.title.indexOf(" ")).toLowerCase();
                
                const collection = interaction.client.database.collection<PostsType>(
                    `${type}_tickets`
                    );
                    const transcriptChannelId = await ChannelIdsModel.getChannelId("transcriptChannelId");
                    const transcriptChannel = channels.find(channel => {
                        return channel.id === transcriptChannelId;
                    }) as TextChannel;
                    
                    if (!transcriptChannel) {
                        return interaction.reply({ content: "Could not find transcript channel.", ephemeral: true });
                    }
                    
                const members = await interaction.guild.members.fetch();
                const messages = await interaction.channel.messages.fetch();
                const post = await collection.findOne({ _id: count });
                const transcript = (await generateFromMessages(
                    messages,
                    interaction.channel,
                    {
                        saveImages: true,
                        fileName: `${interaction.channel.name}.html`,
                        returnType: "attachment",
                    }
                )) as MessageAttachment;

                // Set type content capitalized for display 
                type = type.charAt(0).toUpperCase() + type.slice(1);
                const author = await members.find(member => member.id === post.authorId);
                const transcriptEmbed = new MessageEmbed()
                    .setTitle(`${type} Ticket #${count}`)
                    .setDescription(post.description)
                    .setFields([
                        {
                            name: "Author",
                            value: `${author.user.tag} (${author.user.id})`,
                        },
                        {
                            name: "Attendant",
                            value: `${interaction.user.tag} (${interaction.user.id})`,
                        },
                        {
                            name: "Closed at",
                            value: new Date().toLocaleString(),
                        }
                    ])
                    .setColor("NAVY");

                transcriptChannel.send({ embeds: [transcriptEmbed], files: [transcript] });
                await interaction.channel.delete();
                await collection.deleteOne({ _id: count });
            }
        }
    }
}