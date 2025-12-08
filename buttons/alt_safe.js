const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: /^alt_safe_/,

    async execute(interaction, client, config) {
        const userId = interaction.customId.split("_")[2];

        // Load DB
        const path = "./stats/altdb.json";
        const altdb = JSON.parse(fs.readFileSync(path));

        // Mark safe
        if (!altdb.users[userId]) altdb.users[userId] = {};
        altdb.users[userId].safe = true;

        fs.writeFileSync(path, JSON.stringify(altdb, null, 2));

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle("✅ User Marked Safe")
                    .setDescription(`User <@${userId}> is now marked as **SAFE**.`)
            ]
        });
    }
};
