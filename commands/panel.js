const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Send the ticket panel"),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🎟 Open a Ticket")
            .setDescription("Select the type of ticket below:");

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_menu")
            .setPlaceholder("Choose ticket type")
            .addOptions([
                { label: "Join NLF", value: "Join NLF" },
                { label: "Ally Request", value: "Ally Request" },
                { label: "Support", value: "Support" },
                { label: "Report User", value: "Report User" },
                { label: "Staff Application", value: "Staff Application" }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
