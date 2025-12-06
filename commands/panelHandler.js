const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { loadJSON } = require("../utils/fileManager");

module.exports = {
    async execute(interaction, client) {

        const config = loadJSON("./config/config.json");
        const guild = interaction.guild;
        const user = interaction.user;
        const ticketType = interaction.values[0];

        if (!config.ticketCategory) {
            return interaction.reply({
                content: "❌ Ticket category is not set. Use `/setticketcategory` first.",
                ephemeral: true
            });
        }

        // Create synced channel
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            parent: config.ticketCategory, // SYNC PERMISSIONS
            topic: `Ticket opened by ${user.tag}`
        });

        // Allow the user to view their ticket
        await channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        // Ticket embed
        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🎟 New Ticket Created")
            .addFields(
                { name: "📌 Ticket Type", value: ticketType, inline: true },
                { name: "👤 User", value: `<@${user.id}>`, inline: true }
            )
            .setDescription("A staff member will assist you shortly.")
            .setTimestamp();

        // Buttons
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("unclaim_ticket").setLabel("Unclaim").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("Close").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("transcript_ticket").setLabel("Transcript").setStyle(ButtonStyle.Success)
        );

        await channel.send({ embeds: [embed], components: [buttons] });

        return interaction.reply({
            content: `🎫 Ticket opened: ${channel}`,
            ephemeral: true
        });
    }
};
