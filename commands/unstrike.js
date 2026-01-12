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
        .setName("unstrike")
        .setDescription("Remove a strike from a staff member")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to remove a strike from")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for removing the strike")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {

        const target = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");
        const guild = interaction.guild;
        const member = await guild.members.fetch(target.id);

        // Determine current strike
        let currentStrike = 0;

        if (member.roles.cache.has(STRIKE_ROLES[3])) currentStrike = 3;
        else if (member.roles.cache.has(STRIKE_ROLES[2])) currentStrike = 2;
        else if (member.roles.cache.has(STRIKE_ROLES[1])) currentStrike = 1;

        if (currentStrike === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ No Strikes Found")
                        .setDescription("This user has no strikes to remove.")
                ],
                ephemeral: true
            });
        }

        // Remove all strike roles
        for (const roleId of Object.values(STRIKE_ROLES)) {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId).catch(() => {});
            }
        }

        const newStrike = currentStrike - 1;

        // Add downgraded role if needed
        if (newStrike > 0) {
            await member.roles.add(STRIKE_ROLES[newStrike]);
        }

        // Log embed
        const logEmbed = new EmbedBuilder()
            .setColor("#2ecc71")
            .setTitle("✅ Staff Strike Removed")
            .setDescription(
                `━━━━━━━━━━━━━━━━━━━━━━\n` +
                `👤 **User**\n<@${target.id}>\n\n` +
                `📉 **New Strike Count**\n${newStrike}\n\n` +
                `📝 **Reason**\n${reason}\n` +
                `━━━━━━━━━━━━━━━━━━━━━━`
            )
            .setFooter({
                text: `Action by ${interaction.user.tag}`
            })
            .setTimestamp();

        const logChannel = guild.channels.cache.get(STRIKE_LOG_CHANNEL);
        if (logChannel) {
            await logChannel.send({ embeds: [logEmbed] });
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#2ecc71")
                    .setTitle("✅ Strike Updated")
                    .setDescription(
                        `<@${target.id}> now has **${newStrike} strike(s)**.`
                    )
            ],
            ephemeral: true
        });
    }
};
