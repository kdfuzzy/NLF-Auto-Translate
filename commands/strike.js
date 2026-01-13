const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const STRIKE_LOG_CHANNEL = "1428760038658277386";

const STRIKE_ROLES = {
    1: "1430286428268531803",
    2: "1430288940874731581",
    3: "1430288999649644605"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("strike")
        .setDescription("Issue a staff strike")
        .addUserOption(opt =>
            opt.setName("user")
                .setDescription("User to strike")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("reason")
                .setDescription("Reason for the strike")
                .setRequired(true)
        ),

    async execute(interaction, client, config) {
        try {
            // ================= SAFETY =================
            if (!config) config = {};

            const staffRoles = Array.isArray(config.staffRoles)
                ? config.staffRoles
                : [];

            const isAdmin = interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            );

            const isStaff =
                staffRoles.length > 0 &&
                interaction.member.roles.cache.some(r => staffRoles.includes(r.id));

            if (!isAdmin && !isStaff) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ff2e2e")
                            .setTitle("❌ Permission Denied")
                            .setDescription("Only staff or admins can issue strikes.")
                    ],
                    ephemeral: true
                });
            }

            // ================= INPUT =================
            const member = interaction.options.getMember("user");
            const reason = interaction.options.getString("reason");

            if (!member) {
                return interaction.reply({
                    content: "❌ User not found.",
                    ephemeral: true
                });
            }

            // ================= STRIKE COUNT =================
            let currentStrike = 0;
            for (const [num, roleId] of Object.entries(STRIKE_ROLES)) {
                if (member.roles.cache.has(roleId)) {
                    currentStrike = Math.max(currentStrike, Number(num));
                }
            }

            if (currentStrike >= 3) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ff2e2e")
                            .setTitle("❌ Max Strikes Reached")
                            .setDescription("This user already has 3 strikes.")
                    ],
                    ephemeral: true
                });
            }

            const newStrike = currentStrike + 1;

            // ================= CLEAN OLD STRIKES =================
            for (const roleId of Object.values(STRIKE_ROLES)) {
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId).catch(() => {});
                }
            }

            await member.roles.add(STRIKE_ROLES[newStrike]).catch(() => {});

            // ================= STRIKE EMBED =================
            const strikeEmbed = new EmbedBuilder()
                .setColor("#ff9f1c")
                .setTitle("⚠️ Staff Strike Issued")
                .setDescription(
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `👤 **User:** ${member}\n` +
                    `📌 **Strike Level:** ${newStrike}\n` +
                    `📝 **Reason:** ${reason}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
                )
                .setFooter({ text: `Issued by ${interaction.user.tag}` })
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.get(STRIKE_LOG_CHANNEL);
            if (logChannel) {
                await logChannel.send({ embeds: [strikeEmbed] });
            }

            // ================= DEMOTION ON STRIKE 3 =================
            if (newStrike === 3) {
                const removableRoles = member.roles.cache
                    .filter(r => !r.managed && r.id !== interaction.guild.id)
                    .sort((a, b) => b.position - a.position);

                const roleToRemove = removableRoles.first();

                if (roleToRemove) {
                    await member.roles.remove(roleToRemove);

                    const demoteEmbed = new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("⬇️ Automatic Demotion")
                        .setDescription(
                            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                            `👤 **User:** ${member}\n` +
                            `📉 **Removed Role:** ${roleToRemove.name}\n` +
                            `⚠️ **Reason:** Reached 3 strikes\n` +
                            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
                        )
                        .setTimestamp();

                    if (logChannel) {
                        await logChannel.send({ embeds: [demoteEmbed] });
                    }
                }
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#00ff99")
                        .setTitle("✅ Strike Issued")
                        .setDescription(
                            `${member} now has **${newStrike} strike(s)**.`
                        )
                ],
                ephemeral: true
            });

        } catch (err) {
            console.error("❌ STRIKE COMMAND ERROR:", err);

            if (!interaction.replied) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ff2e2e")
                            .setTitle("❌ Command Failed")
                            .setDescription("An internal error occurred.")
                    ],
                    ephemeral: true
                });
            }
        }
    }
};
