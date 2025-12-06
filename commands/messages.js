const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("messages")
        .setDescription("View message statistics")
        .addUserOption(o =>
            o.setName("user")
            .setDescription("User to check (optional)")
            .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;
        const stats = loadJSON("./stats/messages.json");

        if (!stats[user.id]) {
            return interaction.reply({ content: "❌ No stats found for that user.", ephemeral: true });
        }

        const s = stats[user.id];

        const embed = new EmbedBuilder()
            .setTitle(`📊 Message Stats for ${user.username}`)
            .setColor("Blue")
            .addFields(
                { name: "🗓 Daily", value: `${s.daily}`, inline: true },
                { name: "📅 Weekly", value: `${s.weekly}`, inline: true },
                { name: "📆 All-Time", value: `${s.all}`, inline: true }
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
