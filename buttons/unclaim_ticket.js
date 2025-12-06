module.exports = {
    id: "unclaim_ticket",

    async execute(interaction) {
        const channel = interaction.channel;

        if (!channel.topic?.includes("Claimed by:")) {
            return interaction.reply({
                content: "❌ This ticket is not claimed.",
                ephemeral: true
            });
        }

        await channel.setTopic(channel.topic.replace(/ \| Claimed by: .+/, ""));

        return interaction.reply({
            content: `🟦 Ticket unclaimed.`,
        });
    }
};
