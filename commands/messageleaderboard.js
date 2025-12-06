const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("messageleaderboard")
        .setDescription("Show the top message senders"),

    async execute(interaction) {
        const stats = loadJSON("./stats/messages.json");

        const sorted = Object.entries(stats)
            .sort((a, b) => b[1].all - a[1].all)
            .slice(0, 10);

        if (sorted.length === 0)
            return interaction.reply("❌ No message stats found.");

        let desc = "";
        let pos = 1;

        for (const [id, data] of sorted) {
            desc += `**${pos}.** <@${id}> — ⭐ ${data.all} messages\n`;
            pos++;
        }

        const embed = new EmbedBuilder()
            .setTitle("🏆 Message Leaderboard (All-Time)")
            .setColor("Gold")
            .setDescription(desc)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
