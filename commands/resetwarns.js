const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WARN_FILE = path.join(__dirname, "../stats/warns.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resetwarns")
        .setDescription("Reset all warnings for a user")
        .addUserOption(opt =>
            opt.setName("user")
                .setDescription("User to reset warns for")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const target = interaction.options.getUser("user");

        const warns = JSON.parse(fs.readFileSync(WARN_FILE));

        if (!warns[target.id] || warns[target.id].length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2ecc71")
                        .setTitle("✅ No Warnings")
                        .setDescription(`<@${target.id}> has no warnings to reset.`)
                ],
                ephemeral: true
            });
        }

        delete warns[target.id];
        fs.writeFileSync(WARN_FILE, JSON.stringify(warns, null, 4));

        const warnRoles = [
            "1428759942654984232", // Warn 1
            "1428759939945467964"  // Warn 2
        ];

        const member = await interaction.guild.members.fetch(target.id);

        for (const roleId of warnRoles) {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
            }
        }

        const embed = new EmbedBuilder()
            .setColor("#e74c3c")
            .setTitle("🧹 Warnings Reset")
            .addFields(
                { name: "User", value: `<@${target.id}>`, inline: false },
                { name: "Action By", value: `<@${interaction.user.id}>`, inline: false }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
