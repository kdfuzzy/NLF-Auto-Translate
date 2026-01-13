const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const WARN_FILE = path.join(__dirname, "../stats/warns.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removewarn")
        .setDescription("Remove a specific warning from a user")
        .addUserOption(opt =>
            opt.setName("user")
                .setDescription("User to remove a warn from")
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName("number")
                .setDescription("Warn number to remove (1, 2, 3...)")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const target = interaction.options.getUser("user");
        const number = interaction.options.getInteger("number");

        const warns = JSON.parse(fs.readFileSync(WARN_FILE));
        const userWarns = warns[target.id];

        if (!userWarns || userWarns.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2ecc71")
                        .setTitle("✅ No Warnings")
                        .setDescription(`<@${target.id}> has no warnings.`)
                ],
                ephemeral: true
            });
        }

        if (number < 1 || number > userWarns.length) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ Invalid Warn Number")
                        .setDescription(`This user only has **${userWarns.length}** warnings.`)
                ],
                ephemeral: true
            });
        }

        const removed = userWarns.splice(number - 1, 1);
        warns[target.id] = userWarns;

        if (userWarns.length === 0) {
            delete warns[target.id];
        }

        fs.writeFileSync(WARN_FILE, JSON.stringify(warns, null, 4));

        const warnRoles = {
            1: "1428759942654984232",
            2: "1428759939945467964"
        };

        const member = await interaction.guild.members.fetch(target.id);

        // Remove all warn roles
        for (const roleId of Object.values(warnRoles)) {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
            }
        }

        // Reapply correct warn role
        const newCount = userWarns.length;
        if (warnRoles[newCount]) {
            await member.roles.add(warnRoles[newCount]);
        }

        const embed = new EmbedBuilder()
            .setColor("#f39c12")
            .setTitle("🗑️ Warning Removed")
            .addFields(
                { name: "User", value: `<@${target.id}>`, inline: false },
                { name: "Removed Warn", value: `#${number}`, inline: false },
                { name: "Reason", value: removed[0].reason, inline: false },
                { name: "Remaining Warns", value: `${newCount}`, inline: false }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
