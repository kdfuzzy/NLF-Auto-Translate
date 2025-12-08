const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("altflag")
        .setDescription("Manually flag a user for suspicious behavior.")
        .addUserOption(opt =>
            opt.setName("user")
               .setDescription("User to flag")
               .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("reason")
               .setDescription("Reason for the flag")
               .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");

        const dbPath = "./stats/altdb.json";
        const db = JSON.parse(fs.readFileSync(dbPath));

        if (!db.users[user.id]) db.users[user.id] = {};
        if (!db.users[user.id].flags) db.users[user.id].flags = [];

        db.users[user.id].flags.push(reason);

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("🚨 User Flagged")
                    .setDescription(`**${user.tag}** has been flagged.`)
                    .addFields({ name: "Reason", value: reason })
            ]
        });
    }
};
