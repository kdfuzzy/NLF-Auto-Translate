const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("claim")
        .setDescription("Claim the current ticket")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        try {
            const channel = interaction.channel;
            const user = interaction.user;

            // Must be inside a ticket
            if (!channel.name.startsWith("ticket-")) {
                return interaction.reply({
                    content: "❌ This is not a ticket channel.",
                    ephemeral: true
                });
            }

            // Already claimed
            if (channel.topic && channel.topic.includes("Claimed by:")) {
                return interaction.reply({
                    content: "❌ This ticket is already claimed.",
                    ephemeral: true
                });
            }

            // Update topic
            await channel.setTopic(
                `${channel.topic || ""} | Claimed by: ${user.tag}`
            );

            return interaction.reply({
                content: `✅ Ticket claimed by <@${user.id}>.`,
                allowedMentions: { users: [] }
            });
        } catch (err) {
            console.error("❌ Claim command error:", err);
            return interaction.reply({
                content: "❌ Error claiming ticket.",
                ephemeral: true
            });
        }
    },
};
