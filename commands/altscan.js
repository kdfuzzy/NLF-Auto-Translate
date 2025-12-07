const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const altScore = require("../utils/altScore");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("altscan")
        .setDescription("Scan the entire server for possible alts."),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false });

        const logChannel = interaction.guild.channels.cache.get(client.config.altLogChannel);
        const members = await interaction.guild.members.fetch();

        const results = [];

        for (const member of members.values()) {
            if (member.user.bot) continue;

            const score = altScore(member.user);

            if (score.suspicion > 0) {
                results.push({
                    user: member.user,
                    score
                });
            }
        }

        const embed = new EmbedBuilder()
            .setColor("#ff2e2e")
            .setTitle("📡 Alt Scan Complete")
            .setDescription(`Scanned **${members.size}** users.`)
            .addFields({
                name: "Detected Alts",
                value: results.length
                    ? results
                        .map(x => `• **${x.user.tag}** — ${x.score.suspicion}%`)
                        .join("\n")
                    : "No alts detected."
            })
            .setTimestamp();

        // 1️⃣ Reply in channel
        interaction.followUp({ embeds: [embed] });

        // 2️⃣ Log channel
        if (logChannel) logChannel.send({ embeds: [embed] });

        // 3️⃣ DM admin
        interaction.user.send({ embeds: [embed] }).catch(() => {});
    }
};
