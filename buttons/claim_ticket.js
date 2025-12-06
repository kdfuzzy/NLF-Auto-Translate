module.exports = {
    id: "claim_ticket",

    async execute(interaction) {
        const channel = interaction.channel;
        const user = interaction.user;

        // Prevent claiming twice
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
