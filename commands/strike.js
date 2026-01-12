const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

const STRIKE_LOG_CHANNEL = "1428760038658277386";

// Strike roles
const STRIKE_ROLES = {
    1: "1430286428268531803", // Strike 1
    2: "1430288940874731581", // Strike 2
    3: "1430288999649644605"  // Strike 3
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("strike")
        .setDescription("Issue a staff strike")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to strike")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the strike")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {

        const target = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");
        const guild = interaction.guild;

        const member = await guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ User Not Found")
                        .setDescription("Could not find that member in this server.")
                ],
                ephemeral: true
            });
        }

        // Determine current strike
        let currentStrike = 0;

        if (member.roles.cache.has(STRIKE_ROLES[3])) currentStrike = 3;
        else if (member.roles.cache.has(STRIKE_ROLES[2])) currentStrike = 2;
        else if (member.roles.cache.has(STRIKE_ROLES[1])) currentStrike = 1;

        if (currentStrike >= 3) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("🚫 Max Strikes Reached")
                        .setDescription("This user already has **Strike 3**.")
                ],
                ephemeral: true
            });
        }

        const newStrike = currentStrike + 1;

        // Remove old strike roles
        for (const roleId of Object.values(STRIKE_ROLES)) {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId).catch(() => {});
            }
        }

        // Add new strike role
        await member.roles.add(STRIKE_ROLES[newStrike]);

        // Log embed (wide + clean)
        const logEmbed = new EmbedBuilder()
            .setColor(newStrike === 3 ? "#ff2e2e" : "#ff9f1c")
            .setTitle("⚠️ Staff Strike Issued")
            .setDescription(
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `👤 **User**\n<@${target.id}>\n\n` +
                `📌 **Punishment**\nStrike ${newStrike}\n\n` +
                `📝 **Reason**\n${reason}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━`
            )
            .setFooter({
                text: `Issued by ${interaction.user.tag}`
            })
            .setTimestamp();

        const logChannel = guild.channels.cache.get(STRIKE_LOG_CHANNEL);
        if (logChannel) {
            await logChannel.send({ embeds: [logEmbed] });
        }

        // Confirmation to command user
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#2ecc71")
                    .setTitle("✅ Strike Issued")
                    .setDescription(
                        `<@${target.id}> now has **Strike ${newStrike}**.`
                    )
            ],
            ephemeral: true
        });
    }
};
