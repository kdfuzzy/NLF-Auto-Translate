const { SlashCommandBuilder } = require("discord.js");
const { loadJSON, saveJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("settranslatechannel")
        .setDescription("Add a channel to the auto-translation list")
        .addChannelOption(o =>
            o.setName("channel")
            .setDescription("Channel to enable auto-translate")
            .setRequired(true)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        let config = loadJSON("./config/config.json");

        if (!config.translateChannels.includes(channel.id)) {
            config.translateChannels.push(channel.id);
        }

        saveJSON("./config/config.json", config);

        interaction.reply(`🌍 Enabled auto-translate in <#${channel.id}>`);
    }
};
