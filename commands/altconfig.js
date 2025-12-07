const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("altconfig")
        .setDescription("Configure alt detection")
        .addChannelOption(opt =>
            opt.setName("logchannel")
                .setDescription("Channel for alt alerts")
                .setRequired(true))
        .addIntegerOption(opt =>
            opt.setName("autokickdays")
                .setDescription("Kick users whose account age is under X days (0 = off)")
        ),

    async execute(interaction, client) {
        const logChannel = interaction.options.getChannel("logchannel");
        const autoKick = interaction.options.getInteger("autokickdays") ?? 0;

        const config = client.config;

        config.altLogChannel = logChannel.id;
        config.autoKickUnderDays = autoKick;

        fs.writeFileSync("./config/config.json", JSON.stringify(config, null, 2));

        interaction.reply({
            content: `✅ Alt detection updated:\n📌 Logs → ${logChannel}\n🔨 AutoKick Under Days → ${autoKick}`,
        });
    }
};
