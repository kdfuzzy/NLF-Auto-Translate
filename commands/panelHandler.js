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

        // ---------------------------------------
        // CREATE TICKET CHANNEL (SYNC PERMISSIONS)
        // ---------------------------------------
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            parent: config.ticketCategory,
            topic: `Ticket opened by ${user.tag}`
        });

        // Let the ticket opener see it
        await channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        // ---------------------------------------
        // WELCOME EMBED
        // ---------------------------------------
        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🎟 New Ticket Created")
            .addFields(
                { name: "📌 Ticket Type", value: ticketType, inline: true },
                { name: "👤 Opened By", value: `<@${user.id}>`, inline: true }
            )
            .setDescription("Please describe your issue. A staff member will assist you shortly.")
            .setTimestamp();

        // Buttons
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("unclaim_ticket").setLabel("Unclaim").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("Close").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("transcript_ticket").setLabel("Transcript").setStyle(ButtonStyle.Success)
        );

        // Send embed + buttons
        await channel.send({ embeds: [embed], components: [buttons] });

        // ---------------------------------------
        // AUTO STAFF PING
        // ---------------------------------------
        if (config.staffRoles.length > 0) {

            // Build ping string
            const pings = config.staffRoles.map(r => `<@&${r}>`).join(" ");

            await channel.send({
                content: `📢 **Staff Alert:** ${pings}\nA new ticket has been opened.`
            });

        } else {
            await channel.send({
                content: "⚠️ No staff roles are configured. Use `/addstaffrole @role` to set one."
            });
        }

        // Confirmation to the user
        return interaction.reply({
            content: `🎫 Your ticket has been opened: ${channel}`,
            ephemeral: true
        });
    }
};
