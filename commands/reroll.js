const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reroll")
        .setDescription("Reroll a giveaway and pick a new winner")
        .addStringOption(opt =>
            opt
                .setName("message_id")
                .setDescription("The giveaway message ID")
                .setRequired(true)
        ),

    async execute(interaction, client, config) {
        const messageId = interaction.options.getString("message_id");
        const channel = interaction.channel;

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
                        .setDescription("Only staff can reroll giveaways.")
                ],
                ephemeral: true
            });
        }

        // ================= FETCH MESSAGE =================
        let giveawayMessage;
        try {
            giveawayMessage = await channel.messages.fetch(messageId);
        } catch {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ Giveaway Not Found")
                        .setDescription("Could not find a giveaway with that message ID.")
                ],
                ephemeral: true
            });
        }

        // ================= GET PARTICIPANTS =================
        const reaction = giveawayMessage.reactions.cache.get("🎉");

        if (!reaction) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ No Entries Found")
                        .setDescription("No 🎉 reactions were found on this giveaway.")
                ],
                ephemeral: true
            });
        }

        const users = await reaction.users.fetch();
        const participants = users.filter(u => !u.bot);

        if (participants.size === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ No Valid Entries")
                        .setDescription("There are no valid participants to reroll.")
                ],
                ephemeral: true
            });
        }

        // ================= PICK WINNER =================
        const winner =
            participants.random();

        // ================= ANNOUNCE =================
        const rerollEmbed = new EmbedBuilder()
            .setColor("#7c4dff")
            .setTitle("🎉 Giveaway Rerolled!")
            .setDescription(
                `**New Winner:** ${winner}\n\nCongratulations!`
            )
            .setFooter({
                text: `Rerolled by ${interaction.user.tag}`
            })
            .setTimestamp();

        await giveawayMessage.reply({
            content: `🎊 **New winner:** ${winner}`,
            embeds: [rerollEmbed]
        });

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("#00ff99")
                    .setTitle("✅ Giveaway Rerolled")
                    .setDescription(`A new winner has been selected: ${winner}`)
            ],
            ephemeral: true
        });
    }
};
