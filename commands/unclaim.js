const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unclaim")
        .setDescription("Unclaim the ticket"),

    async execute(interaction, client, config) {
        const member = interaction.member;
        const channel = interaction.channel;

        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id)))
            return interaction.reply({ content: "❌ Staff only.", ephemeral: true });

        if (!channel.name.startsWith("ticket-"))
            return interaction.reply({ content: "❌ Not in a ticket.", ephemeral: true });

        await channel.setTopic(null);
        interaction.reply("🔄 Ticket unclaimed.");
    }
};
