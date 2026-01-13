const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WARN_FILE = path.join(__dirname, "../stats/warns.json");

if (!fs.existsSync(WARN_FILE)) {
    fs.writeFileSync(WARN_FILE, JSON.stringify({}, null, 4));
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
        const target = interaction.options.getUser("user");
        const warns = JSON.parse(fs.readFileSync(WARN_FILE));

        const userWarns = warns[target.id] || [];

        if (userWarns.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2ecc71")
                        .setTitle("✅ No Warnings")
                        .setDescription(`<@${target.id}> has no warnings.`)
                ]
            });
        }

        const warnList = userWarns
            .map((w, i) =>
                `**${i + 1}.** ${w.reason}\n▫️ *By:* ${w.by}\n▫️ *Date:* <t:${Math.floor(new Date(w.date).getTime() / 1000)}:R>`
            )
            .join("\n\n");

        const embed = new EmbedBuilder()
            .setColor("#ff9800")
            .setTitle("⚠️ Warning History")
            .setDescription(`Warnings for <@${target.id}>`)
            .addFields({
                name: "Warns",
                value: warnList
            })
            .setFooter({ text: `Total warns: ${userWarns.length}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
