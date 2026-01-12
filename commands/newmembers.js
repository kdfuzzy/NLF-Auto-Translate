const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("newmembers")
        .setDescription("Send the NLF welcome message for new members"),

    async execute(interaction, client) {
        const member = interaction.member;

        // STAFF ROLE CHECK
        const staffRoles = client.config.staffRoles || [];
        const hasStaffRole = member.roles.cache.some(role =>
            staffRoles.includes(role.id)
        );

        if (!hasStaffRole) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription("❌ You do not have permission to use this command.")
                ],
                ephemeral: true
            });
        }

        // MAIN EMBED
        const embed = new EmbedBuilder()
            .setColor(0x9b59b6)
            .setDescription(
                "<a:2586purplecrown:1429187127576629407> **__Welcome to NLF__** <a:2586purplecrown:1429187127576629407>\n\n" +

                "**🔹 Find the turf below:**\n" +
                "https://discord.com/channels/1428759122521886903/1428760025442160641\n\n" +

                "**👕 Find the gang outfit below:**\n" +
                "https://discord.com/channels/1428759122521886903/1428760028843872406\n\n" +

                "**🔫 Find the gang's guns below:**\n" +
                "https://discord.com/channels/1428759122521886903/1428760027224739993\n\n" +

                "**🤝 Find the gang's allies below:**\n" +
                "https://discord.com/channels/1428759122521886903/1428760026503446620\n\n" +

                "**📍 You can request group perms to access the turf below:**\n" +
                "https://discord.com/channels/1428759122521886903/1428760020337819648\n\n" +

                "**🏷️ Find the group below** *(YOU MUST HAVE NLF IN DISPLAY NAME TO BE ACCEPTED):*\n" +
                "https://discord.com/channels/1428759122521886903/1428759996191084585\n\n" +

                "**📝 Example display name formats:**\n" +
                "`####FrmNLF` / `NLF_####` / `####_NLF`\n\n" +

                "Stay active in **SW2** and in the **Discord server** to show your dedication to the gang and earn roles.\n" +
                "If you have any questions, feel free to contact a member of the **NLF staff team**."
            )
            .setFooter({ text: "NLF • Official Welcome" });

        await interaction.reply({
            embeds: [embed]
        });
    }
};
