const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WARN_FILE = path.join(__dirname, "../../data/warns.json");

function loadWarns() {
    if (!fs.existsSync(WARN_FILE)) return {};
    return JSON.parse(fs.readFileSync(WARN_FILE, "utf8"));
}

function saveWarns(data) {
    fs.writeFileSync(WARN_FILE, JSON.stringify(data, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user")
        .addUserOption(opt =>
            opt.setName("user")
                .setDescription("User to warn")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("reason")
                .setDescription("Reason for the warning")
                .setRequired(true)
        )
        .addBooleanOption(opt =>
            opt.setName("giverole")
                .setDescription("Give warn role? (optional)")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");
        const giveRole = interaction.options.getBoolean("giverole") ?? false;

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: "❌ User not found.", ephemeral: true });
        }

        const warns = loadWarns();
        if (!warns[user.id]) warns[user.id] = [];

        warns[user.id].push({
            reason,
            moderator: interaction.user.tag,
            date: new Date().toISOString()
        });

        saveWarns(warns);

        const warnCount = warns[user.id].length;

        // Warn roles
        const WARN_ROLES = {
            1: "1428759942654984232",
            2: "1428759939945467964"
        };

        if (giveRole && WARN_ROLES[warnCount]) {
            await member.roles.add(WARN_ROLES[warnCount]).catch(() => {});
        }

        const embed = new EmbedBuilder()
            .setColor("#ffb300")
            .setTitle("⚠️ Warning Issued")
            .addFields(
                { name: "👤 User", value: `<@${user.id}>`, inline: true },
                { name: "📌 Total Warns", value: `${warnCount}`, inline: true },
                { name: "📝 Reason", value: reason }
            )
            .setFooter({ text: `Warned by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
