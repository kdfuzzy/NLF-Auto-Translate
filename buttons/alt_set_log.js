const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: "alt_set_log",

    async execute(interaction, client) {
        await interaction.reply({
            embeds: [{
                color: 0xff2e2e,
                title: "📛 Set Alt Log Channel",
                description:
                    "Please **send the channel ID** where alt detection logs should be sent.\n\nExample:\n```\n123456789012345678\n```",
            }],
            ephemeral: true
        });

        const filter = msg => msg.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector.on("collect", msg => {
            const channelId = msg.content.trim();
            const channel = interaction.guild.channels.cache.get(channelId);

            if (!channel) {
                return interaction.followUp({
                    embeds: [{
                        title: "❌ Invalid Channel",
                        color: 0xff2e2e,
                        description: "No channel found with that ID.",
                    }],
                    ephemeral: true
                });
            }

            // Update config
            const config = client.config;
            config.altLogChannel = channelId;

            fs.writeFileSync("./config/config.json", JSON.stringify(config, null, 2));

            interaction.followUp({
                embeds: [{
                    title: "✅ Log Channel Updated",
                    color: 0xff5555,
                    description: `Alt logs will now appear in <#${channelId}>`,
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
