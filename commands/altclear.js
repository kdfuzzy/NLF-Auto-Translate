const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("altclear")
        .setDescription("Clears all alt-detection logs.")
        .setDefaultMemberPermissions(0),

    async execute(interaction) {
        fs.writeFileSync("./stats/altLogs.json", "{}");

        return interaction.reply({
            embeds: [{
                title: "🗑️ Alt Logs Cleared",
                description: "All alt detection data has been wiped.",
                color: 0xff2e2e
            }]
        });
    }
};
