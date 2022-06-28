import { CategoryChannel, CommandInteraction } from "discord.js";

/**
 * @abstract Class representing a ticket.
 */
export abstract class Ticket {
    protected interaction: CommandInteraction;
    protected FIVE_MINUTES = 5 * 60000; // Default time input for the ticket.

    constructor(interaction: CommandInteraction) {
        this.interaction = interaction;
    }

    /**
     * @abstract Start the ticket creation process.
     */
    abstract startReadProcess(): Promise<void>;

    /**
     * Method to create a channel for the ticket.
     * @param name name of the channel
     * @param parent parent of the channel
     * @returns channel
     */
    protected async createChannel(name: string, parent: CategoryChannel) {
        return await this.interaction.guild.channels.create(name, {
            type: "GUILD_TEXT",
            permissionOverwrites: [
                {
                    id: this.interaction.user.id,
                    allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"],
                    deny: ["MANAGE_MESSAGES"],
                },
                {
                    id: this.interaction.guild.id,
                    deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"],
                },
            ],
            parent,
        });
    }

    /**
     * Method to create a category for the ticket.
     * @param name name of the category 
     * @returns category
     */
    protected async createCategory(name: string) {
        const channels = await this.interaction.guild.channels.fetch();
        const category = channels.find(
            channel => channel.type === "GUILD_CATEGORY" && channel.name === name
        ) as CategoryChannel;

        return category
            ? category
            : await this.interaction.guild.channels.create(name, {
                  type: "GUILD_CATEGORY",
                  permissionOverwrites: [
                      {
                          id: this.interaction.guild.id,
                          deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "ADD_REACTIONS"],
                      },
                  ],
              });
    }
}