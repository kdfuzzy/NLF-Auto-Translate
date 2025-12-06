const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { loadJSON, saveJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addstaffrole")
        .setDescription("Add a staff role that can manage tickets")
        .addRoleOption(o =>
            o.setName("role")
            .setDescription("Role to add")
            .setRequired(true)
        ),

    async execute(interaction) {
        const role = interaction.options.getRole("role");

        let config = loadJSON("./config/config.json");

        if (!config.staffRoles.includes(role.id)) {
            config.staffRoles.push(role.id);
        }

        saveJSON("./config/config.json", config);

        interaction.reply(`🟦 Added **${role.name}** as a staff role.`);
    }
};
