const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const translate = require("@iamtraction/google-translate");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translate any text to another language")
        .addStringOption(o =>
            o.setName("text")
            .setDescription("What do you want to translate?")
            .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("to")
            .setDescription("Target language code (example: en, fr, es)")
            .setRequired(true)
        ),

    async execute(interaction) {
        const text = interaction.options.getString("text");
        const to = interaction.options.getString("to");

        try {
            const result = await translate(text, { to });

            const embed = new EmbedBuilder()
                .setTitle("🌍 Translation Result")
                .addFields(
                    { name: "Original Text:", value: text },
                    { name: `Translated (${to}):`, value: result.text }
                )
                .setColor("Blue");

            interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: "❌ Could not translate the text. Check the language code.",
                ephemeral: true
            });
        }
    }
};
