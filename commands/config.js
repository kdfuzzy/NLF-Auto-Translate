const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("View the bot's configuration"),

    async execute(interaction, client, config) {
        const embed = new EmbedBuilder()
            .setTitle("⚙ Bot Configuration")
            .setColor("Purple")
            .addFields(
                { name: "Staff Roles", value: config.staffRoles.map(r => `<@&${r}>`).join(", ") || "None" },
                { name: "Translate Channels", value: config.translateChannels.map(c => `<#${c}>`).join("\n") || "None" },
                { name: "Ticket Category", value: config.ticketCategory || "Not set", inline: true },
                { name: "Transcript Channel", value: config.transcriptChannel ? `<#${config.transcriptChannel}>` : "Not set", inline: true }
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
