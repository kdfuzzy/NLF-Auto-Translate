const { SlashCommandBuilder } = require("discord.js");
const { loadJSON, saveJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("settranscriptchannel")
        .setDescription("Set the channel where transcripts are saved")
        .addChannelOption(o =>
            o.setName("channel")
            .setDescription("The transcript channel")
            .setRequired(true)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        let config = loadJSON("./config/config.json");
        config.transcriptChannel = channel.id;

        saveJSON("./config/config.json", config);

        interaction.reply(`📁 Transcript channel set to <#${channel.id}>`);
    }
};
