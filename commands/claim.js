const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("claim")
        .setDescription("Claim the ticket"),

    async execute(interaction, client, config) {
        const member = interaction.member;
        const channel = interaction.channel;

        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id)))
            return interaction.reply({ content: "❌ You must be staff to claim.", ephemeral: true });

        if (!channel.name.startsWith("ticket-"))
            return interaction.reply({ content: "❌ This is not a ticket channel.", ephemeral: true });

        if (channel.topic && channel.topic.includes("CLAIMED"))
            return interaction.reply({ content: "❌ Already claimed.", ephemeral: true });

        await channel.setTopic(`CLAIMED BY ${member.user.tag}`);
        interaction.reply(`🟦 Ticket claimed by <@${member.id}>`);
    }
};
