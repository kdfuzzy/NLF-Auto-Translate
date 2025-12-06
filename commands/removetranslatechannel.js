const { SlashCommandBuilder } = require("discord.js");
const { loadJSON, saveJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removetranslatechannel")
        .setDescription("Remove a channel from auto-translation")
        .addChannelOption(o =>
            o.setName("channel")
            .setDescription("Channel to disable auto-translate")
            .setRequired(true)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        let config = loadJSON("./config/config.json");

        config.translateChannels = config.translateChannels.filter(c => c !== channel.id);

        saveJSON("./config/config.json", config);

        interaction.reply(`🗑 Disabled auto-translate in <#${channel.id}>`);
    }
};
