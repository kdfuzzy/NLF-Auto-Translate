const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const activeGiveaways = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Create and manage giveaways")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub
                .setName("start")
                .setDescription("Start a giveaway")
                .addStringOption(opt =>
                    opt.setName("prize")
                        .setDescription("Prize name")
                        .setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("duration")
                        .setDescription("Duration in minutes")
                        .setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("winners")
                        .setDescription("Number of winners")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("end")
                .setDescription("End a giveaway early")
                .addStringOption(opt =>
                    opt.setName("message_id")
                        .setDescription("Giveaway message ID")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // ================= START GIVEAWAY =================
        if (sub === "start") {
            const prize = interaction.options.getString("prize");
            const duration = interaction.options.getInteger("duration");
            const winners = interaction.options.getInteger("winners");

            const endTime = Date.now() + duration * 60000;

            const embed = new EmbedBuilder()
                .setColor("#9b59b6")
                .setTitle("🎉 GIVEAWAY 🎉")
                .setDescription(
                    `━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `🎁 **Prize**\n${prize}\n\n` +
                    `👥 **Winners**\n${winners}\n\n` +
                    `⏰ **Ends**\n<t:${Math.floor(endTime / 1000)}:R>\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━`
                )
                .setFooter({ text: "Click the button below to enter!" });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("giveaway_enter")
                    .setLabel("🎉 Enter Giveaway")
                    .setStyle(ButtonStyle.Success)
            );

            const msg = await interaction.channel.send({
                embeds: [embed],
                components: [row]
            });

            activeGiveaways.set(msg.id, {
                prize,
                winners,
                entries: new Set(),
                endTime,
                channelId: msg.channel.id
            });

            setTimeout(() => endGiveaway(msg.id, interaction.client), duration * 60000);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2ecc71")
                        .setTitle("✅ Giveaway Started")
                        .setDescription(`Giveaway started successfully.`)
                ],
                ephemeral: true
            });
        }

        // ================= END GIVEAWAY =================
        if (sub === "end") {
            const messageId = interaction.options.getString("message_id");

            if (!activeGiveaways.has(messageId)) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ff2e2e")
                            .setTitle("❌ Giveaway Not Found")
                            .setDescription("No active giveaway with that message ID.")
                    ],
                    ephemeral: true
                });
            }

            await endGiveaway(messageId, interaction.client);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#2ecc71")
                        .setTitle("✅ Giveaway Ended")
                        .setDescription("Giveaway has been ended.")
                ],
                ephemeral: true
            });
        }
    }
};

// ================= BUTTON HANDLER =================
module.exports.button = async (interaction) => {
    if (interaction.customId !== "giveaway_enter") return;

    const giveaway = activeGiveaways.get(interaction.message.id);
    if (!giveaway) {
        return interaction.reply({ content: "❌ This giveaway has ended.", ephemeral: true });
    }

    giveaway.entries.add(interaction.user.id);

    return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor("#2ecc71")
                .setDescription("🎉 You have entered the giveaway!")
        ],
        ephemeral: true
    });
};

// ================= END GIVEAWAY FUNCTION =================
async function endGiveaway(messageId, client) {
    const giveaway = activeGiveaways.get(messageId);
    if (!giveaway) return;

    const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) return;

    const message = await channel.messages.fetch(messageId).catch(() => null);
    if (!message) return;

    const entries = [...giveaway.entries];
    let winners = [];

    while (winners.length < giveaway.winners && entries.length > 0) {
        const index = Math.floor(Math.random() * entries.length);
        winners.push(entries.splice(index, 1)[0]);
    }

    const resultEmbed = new EmbedBuilder()
        .setColor("#f1c40f")
        .setTitle("🎉 GIVEAWAY ENDED 🎉")
        .setDescription(
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🎁 **Prize**\n${giveaway.prize}\n\n` +
            `🏆 **Winner(s)**\n${winners.length ? winners.map(id => `<@${id}>`).join("\n") : "No valid entries"}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`
        )
        .setTimestamp();

    await message.edit({ components: [] });
    await channel.send({ embeds: [resultEmbed] });

    activeGiveaways.delete(messageId);
}
