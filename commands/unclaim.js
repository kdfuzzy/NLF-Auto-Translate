const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unclaim")
        .setDescription("Unclaim the current ticket"),

    async execute(interaction) {
        const channel = interaction.channel;

        if (!channel.name.startsWith("ticket-")) {
            return interaction.reply({
                content: "❌ You can only use this command inside a ticket.",
                ephemeral: true
            });
        }

        if (!channel.topic?.includes("Claimed by:")) {
            return interaction.reply({
                content: "❌ This ticket is not claimed.",
                ephemeral: true
            });
        }

        await channel.setTopic(channel.topic.replace(/ \| Claimed by: .+/, ""));

        return interaction.reply({
            content: "🟦 Ticket unclaimed.",
        });
    }
};
