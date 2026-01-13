const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WARN_FILE = path.join(__dirname, "../../data/warns.json");

function loadWarns() {
    if (!fs.existsSync(WARN_FILE)) return {};
    return JSON.parse(fs.readFileSync(WARN_FILE, "utf8"));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warncheck")
        .setDescription("Check a user's warnings")
        .addUserOption(opt =>
            opt.setName("user")
                .setDescription("User to check")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const warns = loadWarns();

        const userWarns = warns[user.id] || [];

        if (userWarns.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2ecc71")
                        .setTitle("✅ No Warnings")
                        .setDescription(`<@${user.id}> has no warnings.`)
                ]
            });
        }

        const description = userWarns.map((w, i) =>
            `**${i + 1}.** ${w.reason}\n*By ${w.moderator}*`
        ).join("\n\n");

        const embed = new EmbedBuilder()
            .setColor("#ffb300")
            .setTitle("⚠️ Warning History")
            .setDescription(description)
            .addFields({ name: "📌 Total Warns", value: `${userWarns.length}` })
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
