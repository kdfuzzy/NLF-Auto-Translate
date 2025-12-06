const { SlashCommandBuilder } = require("discord.js");
const { loadJSON, saveJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removestaffrole")
        .setDescription("Remove a staff role")
        .addRoleOption(o =>
            o.setName("role")
            .setDescription("Role to remove")
            .setRequired(true)
        ),

    async execute(interaction) {
        const role = interaction.options.getRole("role");

        let config = loadJSON("./config/config.json");

        config.staffRoles = config.staffRoles.filter(r => r !== role.id);

        saveJSON("./config/config.json", config);

        interaction.reply(`🧹 Removed **${role.name}** from staff roles.`);
    }
};
