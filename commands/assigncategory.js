const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("assigncategory")
        .setDescription("Move this ticket to another category")
        .addStringOption(o =>
            o.setName("categoryid")
            .setDescription("The ID of the category")
            .setRequired(true)
        ),

    async execute(interaction, client, config) {
        const member = interaction.member;
        const channel = interaction.channel;
        const catID = interaction.options.getString("categoryid");

        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id)))
            return interaction.reply({ content: "❌ Staff only.", ephemeral: true });

        await channel.setParent(catID);
        interaction.reply(`📂 Ticket moved to <#${catID}>`);
    }
};
