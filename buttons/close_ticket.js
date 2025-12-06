module.exports = {
    id: "close_ticket",

    async execute(interaction, client, config) {
        const member = interaction.member;

        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id))) {
            return interaction.reply({ content: "❌ Only staff can close tickets.", ephemeral: true });
        }

        interaction.reply("🔒 Closing ticket in 3 seconds...");

        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 3000);
    }
};
