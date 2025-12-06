module.exports = {
    id: "unclaim_ticket",

    async execute(interaction, client, config) {
        const member = interaction.member;

        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id))) {
            return interaction.reply({ content: "❌ You must be staff to unclaim tickets.", ephemeral: true });
        }

        const channel = interaction.channel;

        await channel.setTopic(null);
        interaction.reply("🔄 Ticket unclaimed.");
    }
};
