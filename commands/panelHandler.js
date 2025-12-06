const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { loadJSON, saveJSON } = require("../utils/fileManager");

module.exports = {
    async execute(interaction, client, config) {
        const guild = interaction.guild;
        const user = interaction.user;
        const type = interaction.values[0];

        // Load config again
        config = loadJSON("./config/config.json");

        // Create ticket channel
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`.toLowerCase(),
            type: ChannelType.GuildText,
            parent: config.ticketCategory,
            topic: `TICKET OPENED BY ${user.tag}`,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    id: client.user.id,
                    allow: [PermissionFlagsBits.ViewChannel]
                }
            ]
        });

        // Ticket embed message
        const embed = new EmbedBuilder()
            .setTitle("🎟 New Ticket Opened")
            .addFields(
                { name: "Type", value: type, inline: true },
                { name: "Opened By", value: `<@${user.id}>`, inline: true }
            )
            .setDescription("Please describe your issue in detail. Staff will be with you shortly.")
            .setColor("Blue")
            .setTimestamp();

        // Buttons
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("unclaim_ticket").setLabel("Unclaim").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("Close").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("transcript_ticket").setLabel("Transcript").setStyle(ButtonStyle.Success)
        );

        await channel.send({ embeds: [embed], components: [buttons] });

        await interaction.reply({
            content: `🎟 Ticket created: ${channel}`,
            ephemeral: true
        });
    }
};
