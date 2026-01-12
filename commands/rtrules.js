const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rtrules")
        .setDescription("Post the Role Transfer (RT) rules for NLF")
        // Optional: restrict to staff/admin only
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor("#7b2cff")
            .setTitle("📜 Role Transfer Rules (RT)")
            .setDescription(
                "**Please read carefully before requesting or accepting a role transfer.**"
            )
            .addFields(
                { name: "1️⃣ Discord Time Requirement", value: "Must be in the Discord for **at least 1 month**." },
                { name: "2️⃣ Leave of Absence (LOA)", value: "No LOA until you have been staff for **2 weeks**." },
                { name: "3️⃣ Gang Hopping", value: "**Gang hopping = instant blacklist.**" },
                { name: "4️⃣ Rules & Expectations", value: "You must follow **all NLF rules** and **staff expectations**." },
                { name: "5️⃣ Professionalism", value: "Stay **active** and **professional** at all times." },
                { name: "6️⃣ Permission Abuse", value: "Abuse of permissions will result in **role removal**." },
                { name: "7️⃣ Trial Period", value: "All role transfers are subject to a **trial period** with monitored performance." },
                { name: "8️⃣ Staff Power Abuse", value: "Abuse of staff powers, commands, or permissions may result in **immediate removal** and **possible blacklist**." },
                { name: "9️⃣ Activity Requirement", value: "You must remain active in **Discord and in-game** to keep your transferred role." },
                { name: "🔟 Orders & Operations", value: "Failure to follow orders during gang operations or events may result in **disciplinary action**." },
                { name: "1️⃣1️⃣ Intent of Role Transfer", value: "Role transfers **may not be for power, benefits, or status** — commitment to **NLF is required**." }
            )
            .setFooter({
                text: "NLF Staff Team • Role Transfer System"
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};
