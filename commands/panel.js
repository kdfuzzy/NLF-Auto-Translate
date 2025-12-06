const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Send the ticket panel"),

    async execute(interaction) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_menu")
            .setPlaceholder("📬 Select the type of ticket you want to open")
            .addOptions([
                { label: "Join NLF", value: "join" },
                { label: "Ally Request", value: "ally" },
                { label: "Report / Support", value: "support" },
                { label: "Staff Application", value: "staff" }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            content: "🎫 **Open a ticket by selecting an option below:**",
            components: [row]
        });
    }
};

