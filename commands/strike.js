const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

// CONFIG — CHANGE NOTHING HERE UNLESS IDS CHANGE
const STRIKE_LOG_CHANNEL = "1428760038658277386";

const STRIKE_ROLES = {
    1: "1430286428268531803",
    2: "1430288940874731581",
    3: "1430288999649644605"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("strike")
        .setDescription("Issue a staff strike and log it")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user receiving the strike")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the strike")
                .setRequired(true)
        )
        // Staff-only
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {

        const target = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");
        const guild = interaction.guild;
        const member = await guild.members.fetch(target.id);

        // --------------------------------------------------
        // DETERMINE CURRENT STRIKE COUNT
        // --------------------------------------------------
        let currentStrike = 0;

        if (member.roles.cache.has(STRIKE_ROLES[3])) currentStrike = 3;
        else if (member.roles.cache.has(STRIKE_ROLES[2])) currentStrike = 2;
        else if (member.roles.cache.has(STRIKE_ROLES[1])) currentStrike = 1;

        if (currentStrike >= 3) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ Strike Limit Reached")
                        .setDescription("This user already has **3 strikes**.")
                ],
                ephemeral: true
            });
        }

        const newStrike = currentStrike + 1;
        const newRoleId = STRIKE_ROLES[newStrike];

        // --------------------------------------------------
        // REMOVE OLD STRIKE ROLES
        // --------------------------------------------------
        for (const roleId of Object.values(STRIKE_ROLES)) {
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId).catch(() => {});
            }
        }

        // --------------------------------------------------
        // ADD NEW STRIKE ROLE
        // --------------------------------------------------
        await member.roles.add(newRoleId);

        // --------------------------------------------------
        // LOG EMBED
        // --------------------------------------------------
        const logEmbed = new EmbedBuilder()
            .setColor(newStrike === 3 ? "#ff2e2e" : "#ff9f1c")
            .setTitle("⚠️ Staff Strike Issued")
            .addFields(
                { name: "👤 User", value: `<@${target.id}>`, inline: true },
                { name: "📌 Punishment", value: `Strike ${newStrike}`, inline: true },
                { name: "📝 Reason", value: reason }
            )
            .setFooter({
                text: `Issued by ${interaction.user.tag}`
            })
            .setTimestamp();

        const logChannel = guild.channels.cache.get(STRIKE_LOG_CHANNEL);
        if (logChannel) {
            await logChannel.send({ embeds: [logEmbed] });
        }

        // --------------------------------------------------
        // CONFIRMATION
        // --------------------------------------------------
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#2ecc71")
                    .setTitle("✅ Strike Issued")
                    .setDescription(
                        `<@${target.id}> has received **Strike ${newStrike}**.`
                    )
            ],
            ephemeral: true
        });
    }
};
