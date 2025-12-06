const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rename")
        .setDescription("Rename this ticket channel")
        .addStringOption(o =>
            o.setName("name")
            .setDescription("New ticket name")
            .setRequired(true)
        ),

    async execute(interaction, client, config) {
        const member = interaction.member;
        const newName = interaction.options.getString("name");
        const channel = interaction.channel;

        if (!channel.name.startsWith("ticket-"))
            return interaction.reply({ content: "❌ You can only rename tickets.", ephemeral: true });

        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id)))
            return interaction.reply({ content: "❌ Staff only.", ephemeral: true });

        await channel.setName(newName);

        interaction.reply(`✏️ Ticket renamed to **${newName}**`);
    }
};
