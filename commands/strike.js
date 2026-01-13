const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const STRIKE_LOG_CHANNEL = "1428760038658277386";

// Strike roles
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
        // ================= PERMISSION CHECK =================
        if (
            !interaction.member.roles.cache.some(r =>
                config.staffRoles.includes(r.id)
            ) &&
            !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
        ) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ Permission Denied")
                        .setDescription("Only staff can issue strikes.")
                ],
                ephemeral: true
            });
        }

        const member = interaction.options.getMember("user");
        const reason = interaction.options.getString("reason");

        if (!member) {
            return interaction.reply({
                content: "❌ User not found.",
                ephemeral: true
            });
        }

        // ================= DETERMINE CURRENT STRIKES =================
        let strikeCount = 0;
        for (const [num, roleId] of Object.entries(STRIKE_ROLES)) {
            if (member.roles.cache.has(roleId)) {
                strikeCount = Math.max(strikeCount, Number(num));
            }
        }

        if (strikeCount >= 3) {
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

        const newStrike = strikeCount + 1;

        // ================= REMOVE OLD STRIKE ROLES =================
        for (const roleId of Object.values(STRIKE_ROLES)) {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId).catch(() => {});
            }
        }

        // ================= APPLY NEW STRIKE ROLE =================
        await member.roles.add(STRIKE_ROLES[newStrike]).catch(() => {});

        // ================= STRIKE EMBED =================
        const strikeEmbed = new EmbedBuilder()
            .setColor("#ff9900")
            .setTitle("⚠️ Staff Strike Issued")
            .setDescription(
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `👤 **User:** ${member}\n` +
                `📌 **Strike:** ${newStrike}\n` +
                `📝 **Reason:** ${reason}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━`
            )
            .setFooter({ text: `Issued by ${interaction.user.tag}` })
            .setTimestamp();

        // ================= LOG STRIKE =================
        const logChannel = interaction.guild.channels.cache.get(STRIKE_LOG_CHANNEL);
        if (logChannel) {
            logChannel.send({ embeds: [strikeEmbed] });
        }

        // ================= DEMOTION LOGIC =================
        if (newStrike === 3) {

            // Get roles sorted by position (highest → lowest)
            const roleList = member.roles.cache
                .filter(r => !r.managed && r.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position);

            // Remove highest role (demotion)
            const highestRole = roleList.first();

            if (highestRole) {
                await member.roles.remove(highestRole);

                const demoteEmbed = new EmbedBuilder()
                    .setColor("#ff2e2e")
                    .setTitle("⬇️ Staff Demoted")
                    .setDescription(
                        `━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `👤 **User:** ${member}\n` +
                        `📉 **Removed Role:** ${highestRole.name}\n` +
                        `⚠️ **Reason:** Reached 3 strikes\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━`
                    )
                    .setTimestamp();

                if (logChannel) {
                    logChannel.send({ embeds: [demoteEmbed] });
                }
            }
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#00ff99")
                    .setTitle("✅ Strike Issued")
                    .setDescription(`${member} now has **${newStrike} strike(s)**.`)
            ],
            ephemeral: true
        });
    }
};
