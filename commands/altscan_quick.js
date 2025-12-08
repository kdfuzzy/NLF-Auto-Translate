const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("altscanquick")
        .setDescription("Instantly scans known users in the alt database without lag."),

    async execute(interaction) {
        const path = "./stats/altdb.json";

        if (!fs.existsSync(path)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("❌ No Alt Database Found")
                        .setDescription("There is no altdb.json yet. No suspicious users have been logged.")
                ],
                ephemeral: true
            });
        }

        const db = JSON.parse(fs.readFileSync(path));

        const users = db.users ? Object.values(db.users) : [];

        if (users.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("✅ No Suspicious Users Recorded")
                        .setDescription("Your alt detection database is currently empty.")
                ],
                ephemeral: true
            });
        }

        // Sort users by suspicion score
        const sorted = users
            .filter(u => u.suspicionReported !== undefined)
            .sort((a, b) => b.suspicionReported - a.suspicionReported)
            .slice(0, 20); // Top 20 results only

        const list = sorted.length
            ? sorted
                  .map(
                      (u, i) =>
                          `**${i + 1}. <@${u.id}>** — Suspicion **${u.suspicionReported}**\n` +
                          `• Username: \`${u.username}\`\n` +
                          `• Joined: <t:${Math.floor(u.lastJoin / 1000)}:R>\n` +
                          (u.safe ? "• 🟢 Marked SAFE\n" : u.ignored ? "• ⚪ Ignored\n" : "")
                  )
                  .join("\n\n")
            : "*No users with suspicion scores recorded.*";

        const embed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("⚡ Quick Alt Scan Results")
            .setDescription(
                "This scan checks **only users previously recorded** in the alt database.\n\n" +
                    "No API calls were used — results are instant."
            )
            .addFields({
                name: "🔍 Top Detected Users",
                value: list
            })
            .setFooter({ text: `Total Recorded Users: ${users.length}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
