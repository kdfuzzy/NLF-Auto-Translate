const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("altinfo")
        .setDescription("Show detailed alt detection info about a user.")
        .addUserOption(option =>
            option.setName("user").setDescription("User to check").setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");

        let logs = {};
        try { logs = JSON.parse(fs.readFileSync("./stats/altLogs.json")); } catch {}

        const entry = logs[user.id];

        if (!entry) {
            return interaction.reply({
                embeds: [{
                    title: "⚠️ No Data Found",
                    description: `${user.tag} has no alt logs.`,
                    color: 0xff5555
                }]
            });
        }

        const embed = new EmbedBuilder()
            .setColor("#ff2e2e")
            .setTitle(`🚨 ALT REPORT — ${entry.username}`)
            .addFields(
                { name: "Suspicion Score", value: `${entry.suspicion}%`, inline: true },
                { name: "Account Age", value: `${entry.accountAgeDays} days`, inline: true },
                { name: "Reasons", value: entry.reasons.map(r => `• ${r}`).join("\n") }
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
