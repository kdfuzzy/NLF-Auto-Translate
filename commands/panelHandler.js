// commands/panelHandler.js
const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { loadJSON, saveJSON } = require("../utils/fileManager");

module.exports = {
    async execute(interaction, client) {

        // Load config & stats
        const config = loadJSON("./config/config.json");
        const ticketCounter = loadJSON("./stats/ticketCounter.json");

        const guild = interaction.guild;
        const user = interaction.user;
        const ticketType = interaction.values[0];

        if (!config.ticketCategory) {
            return interaction.reply({
                content: "❌ Ticket category is not set. Use `/setticketcategory`.",
                ephemeral: true
            });
        }

        // ---------------------------------------
        // 1️⃣ GENERATE NEW TICKET ID
        // ---------------------------------------
        const newID = (ticketCounter.lastID || 0) + 1;
        ticketCounter.lastID = newID;
        saveJSON("./stats/ticketCounter.json", ticketCounter);

        // Format username cleanly
        const cleanUser = user.username.toLowerCase().replace(/[^a-z0-9]/g, "");

        // Channel name with ID included
        const channelName = `ticket-${newID}-${cleanUser}`;

        // ---------------------------------------
        // 2️⃣ CREATE CHANNEL WITH SYNCED PERMISSIONS
        // ---------------------------------------
        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: config.ticketCategory,
            topic: `Ticket #${newID} opened by ${user.tag} (${user.id})`
        });

        // Allow ticket opener
        await channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        // ---------------------------------------
        // 3️⃣ WELCOME EMBED
        // ---------------------------------------
        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`🎟 Ticket #${newID}`)
            .addFields(
                { name: "📌 Type", value: ticketType, inline: true },
                { name: "👤 Opened By", value: `<@${user.id}>`, inline: true }
            )
            .setDescription(
                "Please describe your issue in detail.\n" +
                "A staff member will assist you shortly."
            )
            .setTimestamp();

        // Buttons
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("unclaim_ticket").setLabel("Unclaim").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("Close").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("transcript_ticket").setLabel("Transcript").setStyle(ButtonStyle.Success)
        );

        await channel.send({ embeds: [embed], components: [buttons] });

        // ---------------------------------------
        // 4️⃣ STAFF AUTO-PING (IF ENABLED)
        // ---------------------------------------
        if (config.staffRoles.length > 0) {
            const pings = config.staffRoles.map(r => `<@&${r}>`).join(" ");
            await channel.send(`📢 **Staff Alert:** ${pings}\nA new ticket (#${newID}) has been opened.`);
        }

        // ---------------------------------------
        // 5️⃣ USER CONFIRMATION
        // ---------------------------------------
        return interaction.reply({
            content: `🎫 **Ticket #${newID}** has been created: ${channel}`,
            ephemeral: true
        });
    }
};
