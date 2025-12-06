const { SlashCommandBuilder } = require("discord.js");
const { loadJSON, saveJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setticketcategory")
        .setDescription("Set the category where new tickets will be created")
        .addStringOption(o =>
            o.setName("categoryid")
            .setDescription("ID of the category")
            .setRequired(true)
        ),

    async execute(interaction) {
        const catID = interaction.options.getString("categoryid");

        let config = loadJSON("./config/config.json");
        config.ticketCategory = catID;

        saveJSON("./config/config.json", config);

        interaction.reply(`📂 Ticket category set to **${catID}**.`);
    }
};
