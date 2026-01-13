const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WARN_FILE = path.join(__dirname, "../stats/warns.json");

// Ensure file exists
if (!fs.existsSync(WARN_FILE)) {
    fs.writeFileSync(WARN_FILE, JSON.stringify({}, null, 4));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a staff member")
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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const target = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");

        const warns = JSON.parse(fs.readFileSync(WARN_FILE));
        if (!warns[target.id]) warns[target.id] = [];

        warns[target.id].push({
            reason,
            by: interaction.user.tag,
            date: new Date().toISOString()
        });

        fs.writeFileSync(WARN_FILE, JSON.stringify(warns, null, 4));

        const warnCount = warns[target.id].length;

        // Warn roles
        const warnRoles = {
            1: "1428759942654984232",
            2: "1428759939945467964"
        };

        const member = await interaction.guild.members.fetch(target.id);

        // Remove previous warn roles
        for (const roleId of Object.values(warnRoles)) {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
            }
        }

        // Add new warn role if exists
        if (warnRoles[warnCount]) {
            await member.roles.add(warnRoles[warnCount]);
        }

        const embed = new EmbedBuilder()
            .setColor("#ffb300")
            .setTitle("⚠️ Staff Warning Issued")
            .addFields(
                { name: "User", value: `<@${target.id}>`, inline: false },
                { name: "Warn Count", value: `${warnCount}`, inline: false },
                { name: "Reason", value: reason, inline: false }
            )
            .setFooter({ text: `Warned by ${interaction.user.tag}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
