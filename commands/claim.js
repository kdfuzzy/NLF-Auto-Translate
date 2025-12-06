const { SlashCommandBuilder } = require("discord.js");
const { loadJSON, saveJSON } = require("../utils/fileManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("claim")
        .setDescription("Claim the ticket"),

    async execute(interaction, client, config) {
        const member = interaction.member;
        const channel = interaction.channel;

        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id)))
            return interaction.reply({ content: "❌ You must be staff to claim.", ephemeral: true });

        if (!channel.name.startsWith("ticket-"))
            return interaction.reply({ content: "❌ This is not a ticket channel.", ephemeral: true });

        if (channel.topic && channel.topic.includes("CLAIMED"))
            return interaction.reply({ content: "❌ Already claimed.", ephemeral: true });

        // Set ticket as claimed
        await channel.setTopic(`CLAIMED BY ${member.user.tag}`);

        // ---------------------------
        // UPDATE TICKET STATS
        // ---------------------------
        let stats = loadJSON("./stats/tickets.json");

        if (!stats[member.id]) {
            stats[member.id] = { daily: 0, weekly: 0, all: 0 };
        }

        stats[member.id].daily++;
        stats[member.id].weekly++;
        stats[member.id].all++;

        saveJSON("./stats/tickets.json", stats);

        interaction.reply(`🟦 Ticket claimed by <@${member.id}>`);
    }
};
