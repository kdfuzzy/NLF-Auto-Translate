const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rt")
        .setDescription("Post the NLF Role Transfer (RT) staff application")
        // Restrict to staff/admin if you want
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#7b2cff")
            .setTitle("📋 NLF Role Transfer (RT) Application")
            .setDescription(
                "**Fill out the application below clearly and honestly:**"
            )
            .addFields(
                { name: "1️⃣ Age", value: "Your age" },
                { name: "2️⃣ Voice Chat", value: "Do you use voice chat?" },
                { name: "3️⃣ Current Role", value: "What role are you transferring from?" },
                { name: "4️⃣ Desired Role", value: "What role are you applying for?" },
                { name: "5️⃣ Past Staff Experience", value: "List any past staff experience" },
                { name: "6️⃣ Activity Level", value: "How active are you? **(1–10)**" },
                { name: "7️⃣ Why Should We Accept You?", value: "Explain why you stand out" }
            )
            .addFields({
                name: "📌 Important",
                value: "**RT is open for Middle Rank and Low Rank only.**"
            })
            .setFooter({
                text: "NLF Staff Team • Role Transfer System"
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};
