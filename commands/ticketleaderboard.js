const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticketleaderboard")
        .setDescription("Show top staff ticket handlers"),

    async execute(interaction) {
        const stats = loadJSON("./stats/tickets.json");

        const sorted = Object.entries(stats)
            .sort((a, b) => b[1].all - a[1].all)
            .slice(0, 10);

        if (sorted.length === 0)
            return interaction.reply("❌ No ticket stats found.");

        let desc = "";
        let pos = 1;

        for (const [id, data] of sorted) {
            desc += `**${pos}.** <@${id}> — 🎫 ${data.all} tickets\n`;
            pos++;
        }

        const embed = new EmbedBuilder()
            .setTitle("🏆 Ticket Leaderboard (All-Time)")
            .setColor("Purple")
            .setDescription(desc)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
