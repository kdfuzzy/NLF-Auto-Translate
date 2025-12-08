const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: /^alt_kick_/,

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

        await member.kick(`NLF Anti-Alt System: Staff Kick`);

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle("👢 User Kicked")
                    .setDescription(`User <@${userId}> has been **kicked**.`)
            ]
        });
    }
};
