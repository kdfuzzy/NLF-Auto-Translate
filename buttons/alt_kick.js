module.exports = {
    id: /^alt_kick_/,

    async execute(interaction) {
        const userId = interaction.customId.split("_")[2];
        const member = await interaction.guild.members.fetch(userId).catch(() => null);

        if (!member) {
            return interaction.reply({
                embeds: [{
                    title: "❌ Error",
                    description: "User not found.",
                    color: 0xff2e2e
                }],
                ephemeral: true
            });
        }

        await member.kick("Alt detection");

        return interaction.reply({
            embeds: [{
                title: "👢 User Kicked",
                description: `<@${userId}> has been kicked.`,
                color: 0xff5555
            }]
        });
    }
};
