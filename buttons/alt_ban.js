module.exports = {
    id: /^alt_ban_/,

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

        await member.ban({ reason: "Alt detection system" });

        return interaction.reply({
            embeds: [{
                title: "🔨 User Banned",
                description: `<@${userId}> has been banned.`,
                color: 0xff2e2e
            }]
        });
    }
};
