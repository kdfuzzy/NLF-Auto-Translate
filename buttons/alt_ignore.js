module.exports = {
    id: /^alt_ignore_/,

    async execute(interaction) {
        return interaction.reply({
            embeds: [{
                title: "🟢 Alert Ignored",
                description: "This alt alert has been dismissed.",
                color: 0x00ff66
            }],
            ephemeral: true
        });
    }
};
