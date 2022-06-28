import {
    AwaitMessageCollectorOptionsParams,
    AwaitMessagesOptions,
    CommandInteraction,
    MappedInteractionTypes,
    MessageActionRow,
    MessageButton,
    MessageButtonOptions,
    MessageEmbed,
    MessageEmbedOptions,
    MessageSelectMenu,
    MessageSelectMenuOptions,
} from "discord.js";

type AwaitOptions<T extends keyof MappedInteractionTypes> =
    AwaitMessageCollectorOptionsParams<T, true>;

export type SelectMenuOptions = Record<"menu", MessageSelectMenuOptions> &
    Record<"awaitOptions", AwaitOptions<"SELECT_MENU">> &
    MessageEmbedOptions;
export type ButtonOptions = Record<"buttons", MessageButtonOptions[]> &
    Record<"awaitOptions", AwaitOptions<"BUTTON">> &
    MessageEmbedOptions;
export type MessageOptions = Record<"awaitOptions", AwaitMessagesOptions> &
    MessageEmbedOptions;

export namespace Input {
    export async function awaitSelectMenu(
        interaction: CommandInteraction,
        options: SelectMenuOptions
    ) {
        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu(options.menu)
        );
        const embed = new MessageEmbed(options);

        await interaction.reply({ embeds: [embed], components: [row] }).catch(() => {
            interaction.editReply({ embeds: [embed], components: [row] }) 
        });

        const response = await interaction.channel?.awaitMessageComponent(options.awaitOptions);

        return response;
    }


    export async function awaitButton(
        interaction: CommandInteraction,
        options: ButtonOptions
    ) {
        const buttons: MessageButton[] = [];

        for (const buttonOptions of options.buttons) {
            buttons.push(new MessageButton(buttonOptions));
        }

        const row = new MessageActionRow().addComponents(buttons);
        const embed = new MessageEmbed(options);

        await interaction.reply({ embeds: [embed], components: [row] }).catch(() => {
            interaction.editReply({ embeds: [embed], components: [row] }) 
        });
        const response = await interaction.channel?.awaitMessageComponent(options.awaitOptions);

        return response;
    }

    export async function awaitMessage(
        interaction: CommandInteraction,
        options: MessageOptions
    ) {
        const embed = new MessageEmbed(options);

        await interaction.reply({ embeds: [embed], components: [] }).catch(() => {
            interaction.editReply({ embeds: [embed], components: [] }) 
        });
        const response = await interaction.channel?.awaitMessages(options.awaitOptions);

        return response;
    }
}