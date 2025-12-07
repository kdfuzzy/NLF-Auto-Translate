const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("altsettings")
        .setDescription("Open the alt detection settings panel."),

    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor("#ff2e2e")
            .setTitle("⚙️ Alt Detection Settings")
            .setDescription("Use the buttons below to configure the system.")
            .addFields(
                { name: "Log Channel", value: `<#${client.config.altLogChannel || "None"}>` },
                { name: "Auto Kick Under Days", value: client.config.autoKickUnderDays.toString() }
            )
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("alt_set_log")
                .setLabel("Set Log Channel")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("alt_set_autokick")
                .setLabel("Set AutoKick Days")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("alt_disable_autokick")
                .setLabel("Disable AutoKick")
                .setStyle(ButtonStyle.Success)
        );

        interaction.reply({ embeds: [embed], components: [row] });
    }
};
