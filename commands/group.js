const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("group")
        .setDescription("Post the official NLF Roblox group link"),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#7b2cff")
            .setTitle("👥 NLF Official Group")
            .setDescription(
                "**Join the official NLF Roblox group below:**\n\n" +
                "🔗 **Link:**\n" +
                "https://www.roblox.com/communities/35970369/NLF-Official-Group#!/about](https://www.roblox.com/communities/35970369/NLF-Official-Group#!/about"
            )
            .setFooter({
                text: "NLF • Official Roblox Group"
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};
