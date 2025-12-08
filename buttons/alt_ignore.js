const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: /^alt_ignore_/,

    async execute(interaction, client, config) {
        const userId = interaction.customId.split("_")[2];

        // Load DB
        const path = "./stats/altdb.json";
        const altdb = JSON.parse(fs.readFileSync(path));

        // Mark ignored
        if (!altdb.users[userId]) altdb.users[userId] = {};
        altdb.users[userId].ignored = true;

        fs.writeFileSync(path, JSON.stringify(altdb, null, 2));

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Grey")
                    .setTitle("👁️ User Ignored")
                    .setDescription(`User <@${userId}> has been marked as **ignored**.`)
            ]
        });
    }
};
