const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tickets")
        .setDescription("View ticket-handling statistics")
        .addUserOption(o =>
            o.setName("user")
            .setDescription("User to check (optional)")
            .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;
        const stats = loadJSON("./stats/tickets.json");

        if (!stats[user.id]) {
            return interaction.reply({ content: "❌ No ticket stats for this user.", ephemeral: true });
        }

        const t = stats[user.id];

        const embed = new EmbedBuilder()
            .setTitle(`🎫 Ticket Stats for ${user.username}`)
            .setColor("Green")
            .addFields(
                { name: "🗓 Daily", value: `${t.daily}`, inline: true },
                { name: "📅 Weekly", value: `${t.weekly}`, inline: true },
                { name: "📆 All-Time", value: `${t.all}`, inline: true }
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
