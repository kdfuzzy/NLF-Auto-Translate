const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: /^alt_ban_/,

    async execute(interaction, client, config) {
        const userId = interaction.customId.split("_")[2];
        const guild = interaction.guild;

        const member = await guild.members.fetch(userId).catch(() => null);

        if (!member) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("❌ User Not Found")
                        .setDescription("They may have already left the server.")
                ],
                ephemeral: true
            });
        }

        await member.ban({ reason: `NLF Anti-Alt System: Staff Ban` });

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("🔨 User Banned")
                    .setDescription(`User <@${userId}> has been **banned**.`)
            ]
        });
    }
};
