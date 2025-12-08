const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: /^alt_flag_/,

    async execute(interaction) {
        const targetId = interaction.customId.split("_")[2];
        const staffId = interaction.user.id;

        const db = JSON.parse(fs.readFileSync("./stats/altdb.json"));

        if (!db.users[targetId]) db.users[targetId] = {};
        if (!db.users[targetId].flags) db.users[targetId].flags = [];

        db.users[targetId].flags.push(`Flagged by <@${staffId}> (Button Click)`);

        fs.writeFileSync("./stats/altdb.json", JSON.stringify(db, null, 2));

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Yellow")
                    .setTitle("📰 User Flagged")
                    .setDescription(`User <@${targetId}> has been flagged by <@${staffId}>.`)
            ]
        });
    }
};
