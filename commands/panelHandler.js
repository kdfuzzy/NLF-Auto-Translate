const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    async execute(interaction, client, config) {
        const guild = interaction.guild;
        const user = interaction.user;
        const ticketType = interaction.values[0];

        const category = config.ticketCategory;

        // Create the ticket channel
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`.toLowerCase(),
            type: ChannelType.GuildText,
            parent: category,
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

        // Greeting embed
        const embed = new EmbedBuilder()
            .setTitle("🎫 New Ticket Opened")
            .addFields(
                { name: "Ticket Type", value: ticketType, inline: true },
                { name: "User", value: `<@${user.id}>`, inline: true }
            )
            .setDescription("Please describe your issue in as much detail as possible.\nA staff member will assist you shortly.")
            .setColor("Blue")
            .setTimestamp();

        // Buttons
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setLabel("Claim").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("unclaim_ticket").setLabel("Unclaim").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("close_ticket").setLabel("Close").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("transcript_ticket").setLabel("Transcript").setStyle(ButtonStyle.Success)
        );

        // Send welcome message
        await channel.send({ embeds: [embed], components: [buttons] });

        await interaction.reply({
            content: `🎟 Ticket created: ${channel}`,
            ephemeral: true
        });
    }
};
