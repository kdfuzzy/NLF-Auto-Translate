// commands/panelHandler.js
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

        // Load config fresh
        const config = loadJSON("./config/config.json");
        const guild = interaction.guild;
        const user = interaction.user;
        const ticketType = interaction.values[0];

        if (!config.ticketCategory) {
            return interaction.reply({
                content: "❌ Ticket category is not set. Use `/setticketcategory`.",
                ephemeral: true
            });
        }

        // -----------------------------------------------------
        // 1️⃣ CREATE TICKET WITH TRUE CATEGORY SYNC
        // -----------------------------------------------------
        // No permissionOverwrites here. NONE. Otherwise sync breaks.
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            parent: config.ticketCategory, // Automatically syncs permissions
            topic: `Ticket opened by ${user.tag}`
        });

        // -----------------------------------------------------
        // 2️⃣ ALLOW TICKET OPENER ACCESS (THIS DOES NOT BREAK SYNC)
        // -----------------------------------------------------
        await channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        // -----------------------------------------------------
        // 3️⃣ WELCOME EMBED
        // -----------------------------------------------------
        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🎟 New Ticket Created")
            .addFields(
                { name: "📌 Ticket Type", value: ticketType, inline: true },
                { name: "👤 Opened By", value: `<@${user.id}>`, inline: true }
            )
            .setDescription(
                "Thank you for opening a ticket.\n" +
                "Please explain your issue, and a staff member will assist you shortly."
            )
            .setTimestamp();

        // -----------------------------------------------------
        // 4️⃣ STAFF BUTTONS
        // -----------------------------------------------------
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("claim_ticket")
                .setLabel("Claim")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("unclaim_ticket")
                .setLabel("Unclaim")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("close_ticket")
                .setLabel("Close")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("transcript_ticket")
                .setLabel("Transcript")
                .setStyle(ButtonStyle.Success)
        );

        // -----------------------------------------------------
        // 5️⃣ SEND TICKET MESSAGE
        // -----------------------------------------------------
        await channel.send({ embeds: [embed], components: [buttons] });

        // -----------------------------------------------------
        // 6️⃣ CONFIRMATION TO USER
        // -----------------------------------------------------
        return interaction.reply({
            content: `🎫 Your ticket has been opened: ${channel}`,
            ephemeral: true
        });
    }
};
