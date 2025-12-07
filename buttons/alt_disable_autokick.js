const fs = require("fs");

module.exports = {
    id: "alt_disable_autokick",

    async execute(interaction, client) {
        const config = client.config;
        config.autoKickUnderDays = 0;

        fs.writeFileSync("./config/config.json", JSON.stringify(config, null, 2));

        interaction.reply({
            embeds: [{
                title: "🛑 AutoKick Disabled",
                description: "The auto-kick system has been turned **OFF**.",
                color: 0xff5555
            }]
        });
    }
};
