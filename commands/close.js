const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("close")
        .setDescription("Close the ticket"),

    async execute(interaction, client, config) {
        const member = interaction.member;

        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id)))
            return interaction.reply({ content: "❌ Staff only.", ephemeral: true });

        interaction.reply("🔒 Closing ticket in 3 seconds...");

        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 3000);
    }
};
