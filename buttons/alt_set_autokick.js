const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: "alt_set_autokick",

    async execute(interaction, client) {
        await interaction.reply({
            embeds: [{
                color: 0xff2e2e,
                title: "⚠️ Set AutoKick Days",
                description:
                    "Send the minimum account age (in days) required to avoid being auto-kicked.\n\n**Example:**\n```\n7\n```",
            }],
            ephemeral: true
        });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector.on("collect", msg => {
            const days = parseInt(msg.content.trim());

            if (isNaN(days) || days < 0) {
                return interaction.followUp({
                    embeds: [{
                        title: "❌ Invalid Number",
                        color: 0xff2e2e,
                        description: "Please enter a valid number.",
                    }],
                    ephemeral: true
                });
            }

            const config = client.config;
            config.autoKickUnderDays = days;

            fs.writeFileSync("./config/config.json", JSON.stringify(config, null, 2));

            interaction.followUp({
                embeds: [{
                    title: "✅ AutoKick Updated",
                    color: 0xff5555,
                    description: `Users with accounts younger than **${days} days** will now be auto-kicked.`,
                }]
            });
        });

        collector.on("end", collected => {
            if (collected.size === 0) {
                interaction.followUp({
                    embeds: [{
                        title: "⌛ Timed Out",
                        description: "No response received.",
                        color: 0xff5555
                    }],
                    ephemeral: true
                });
            }
        });
    }
};
