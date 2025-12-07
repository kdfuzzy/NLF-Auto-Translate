module.exports = {
    id: /^alt_ban_/,

    async execute(interaction) {
        const userId = interaction.customId.split("_")[2];
        const member = await interaction.guild.members.fetch(userId).catch(() => null);

        if (!member) {
            return interaction.reply({ content: "❌ User not found.", ephemeral: true });
        }

        await member.ban({ reason: "Alt detection system" });

        interaction.reply({
            content: `🔨 User <@${userId}> has been **banned**.`,
            ephemeral: false
        });
    }
};
