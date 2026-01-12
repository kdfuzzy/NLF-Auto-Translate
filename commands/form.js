const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("form")
        .setDescription("Send the NLF application form"),

    async execute(interaction, client) {
        const member = interaction.member;
        const staffRoles = client.config.staffRoles || [];

        // Permission check
        if (!member.roles.cache.some(role => staffRoles.includes(role.id))) {
            return interaction.reply({
                content: "❌ You do not have permission to use this command.",
                ephemeral: true
            });
        }

        // Embed
        const embed = new EmbedBuilder()
            .setColor("#7b3fe4")
            .setTitle("**__NLF FORM__::**")
            .setDescription(
                "> **• Your Age =**\n\n" +
                "> **• Device You Play On =**\n\n" +
                "> **• Past Gang =**\n\n" +
                "> **• Why you want to join NLF =**\n\n" +
                "> **• Do you talk in vc? =**\n\n" +
                "> **• Why we should pick you over other members =**\n\n" +
                "> **• Aim Video =**\n\n" +
                "> **• Screenshot/video of ALL your Discord servers =**\n\n" +
                "> **• Screenshot/video of ALL your Roblox groups =**"
            )
            .setFooter({
                text: "NLF • Applications",
                iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
