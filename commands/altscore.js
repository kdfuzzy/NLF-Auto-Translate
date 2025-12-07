const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const altScore = require("../utils/altScore");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("altscore")
        .setDescription("Check suspicion score for a user.")
        .addUserOption(opt =>
            opt.setName("user").setDescription("User to scan").setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const score = altScore(user);

        const embed = new EmbedBuilder()
            .setColor("#ff2e2e")
            .setTitle(`🔍 Suspicion Score — ${user.tag}`)
            .addFields(
                { name: "Score", value: `${score.suspicion}%`, inline: true },
                { name: "Account Age", value: `${score.accountAgeDays} days`, inline: true },
                {
                    name: "Reasons",
                    value: score.reasons.length ? score.reasons.map(r => `• ${r}`).join("\n") : "No suspicious signs."
                }
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
