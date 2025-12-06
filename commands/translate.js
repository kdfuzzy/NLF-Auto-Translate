const { SlashCommandBuilder } = require("discord.js");
const translate = require("@iamtraction/google-translate");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translate any text")
        .addStringOption(o =>
            o.setName("text")
             .setDescription("Text to translate")
             .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("to")
             .setDescription("Language code (e.g., en, fr, es)")
             .setRequired(true)
        ),

    async execute(interaction) {
        const text = interaction.options.getString("text");
        const to = interaction.options.getString("to");

        const result = await translate(text, { to });

        await interaction.reply(`🔤 **Translated:** ${result.text}`);
    }
};
