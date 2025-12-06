const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("claim")
        .setDescription("Claim the current ticket"),

    async execute(interaction) {
        const channel = interaction.channel;
        const user = interaction.user;

        // Validate channel
        if (!channel.name.startsWith("ticket-")) {
            return interaction.reply({
                content: "❌ You can only claim inside a ticket channel.",
                ephemeral: true
            });
        }

        // Already claimed?
        if (channel.topic?.includes("Claimed by:")) {
            return interaction.reply({
                content: "❌ This ticket is already claimed.",
                ephemeral: true
            });
        }

        await channel.setTopic(`${channel.topic || ""} | Claimed by: ${user.tag}`);

        return interaction.reply({
            content: `✅ Ticket claimed by <@${user.id}>.`,
        });
    }
};
