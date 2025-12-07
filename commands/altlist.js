const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("altlist")
        .setDescription("Displays a list of all detected alts."),

    async execute(interaction) {
        let logs = {};
        try { logs = JSON.parse(fs.readFileSync("./stats/altLogs.json")); } catch {}

        const entries = Object.values(logs);

        if (entries.length === 0) {
            return interaction.reply({
                embeds: [{
                    title: "📭 No Alts Found",
                    color: 0xff5555,
                    description: "No alt accounts have been detected yet."
                }]
            });
        }

        const sorted = entries.sort((a, b) => b.suspicion - a.suspicion);

        const embed = new EmbedBuilder()
            .setTitle("🚨 Alt Detection Log")
            .setColor("#ff2e2e")
            .setDescription(sorted.map(e =>
                `🔹 **${e.username}** — ${e.suspicion}% suspicion\n🕒 Age: ${e.accountAgeDays} days`
            ).join("\n\n"))
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
