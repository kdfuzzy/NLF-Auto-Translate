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
            return interaction.reply({ content: "❌ Ticket category not set in config.", ephemeral: true });
        }

        // Create ticket channel
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`.toLowerCase(),
            type: ChannelType.GuildText,
            parent: config.ticketCategory,
            topic: `Ticket opened by ${user.tag}`
        });

        // Permission overwrites
        await channel.permissionOverwrites.set([
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
        ]);

        // Create embed
        const embed = new EmbedBuilder()
            .setTitle("🎟 New Ticket Created")
            .addFields(
                { name: "Type", value: ticketType, inline: true },
                { name: "User", value: `<@${user.id}>`, inline: true }
            )
            .setDescription("Please describe your issue. A staff member will assist you shortly.")
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

        return interaction.reply({
            content: `🎫 Ticket created: ${channel}`,
            ephemeral: true
        });
    }
};
