const {
    ChannelType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    async execute(interaction, client, config) {

        const guild = interaction.guild;
        const user = interaction.user;
        const type = interaction.values[0];

        if (!config.ticketCategory)
            return interaction.reply({
                content: "Ticket category not set. Use /setticketcategory",
                ephemeral: true
            });

        // Create ticket channel under category (auto sync perms)
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`,
            parent: config.ticketCategory,
            type: ChannelType.GuildText,
            topic: `Ticket by ${user.tag} (${type})`
        });

        // Allow user to view
        await channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true
        });

        // Embed
        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🎟 Ticket Created")
            .setDescription(`Ticket type: **${type}**`)
            .addFields({ name: "User", value: `<@${user.id}>` })
            .setTimestamp();

        // Buttons
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("claim_ticket").setStyle(ButtonStyle.Primary).setLabel("Claim"),
            new ButtonBuilder().setCustomId("unclaim_ticket").setStyle(ButtonStyle.Secondary).setLabel("Unclaim"),
            new ButtonBuilder().setCustomId("close_ticket").setStyle(ButtonStyle.Danger).setLabel("Close"),
            new ButtonBuilder().setCustomId("transcript_ticket").setStyle(ButtonStyle.Success).setLabel("Transcript")
        );

        await channel.send({ embeds: [embed], components: [buttons] });

        return interaction.reply({
            content: `Ticket created: ${channel}`,
            ephemeral: true
        });
    }
};
