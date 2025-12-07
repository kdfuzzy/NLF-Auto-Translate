module.exports = {
    id: /^alt_ignore_/,

    async execute(interaction) {
        interaction.reply({
            content: "🟢 Alert ignored.",
            ephemeral: true
        });
    }
};
