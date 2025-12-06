module.exports = {
    id: "claim_ticket",

    async execute(interaction, client, config) {
        const member = interaction.member;

        // Check if user is staff
        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id))) {
            return interaction.reply({ content: "❌ You must be staff to claim tickets.", ephemeral: true });
        }

        const channel = interaction.channel;

        // Prevent double-claim
        if (channel.topic && channel.topic.includes("CLAIMED")) {
            return interaction.reply({ content: "❌ This ticket is already claimed.", ephemeral: true });
        }

        await channel.setTopic(`CLAIMED BY ${member.user.tag}`);
        interaction.reply(`🟦 Ticket claimed by <@${member.id}>`);
    }
};

