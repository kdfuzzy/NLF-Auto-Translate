const { Events, EmbedBuilder } = require("discord.js");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {

        // Reload config every interaction
        let config;
        try {
            config = loadJSON("./config/config.json");
        } catch (err) {
            console.error("❌ Failed to load config.json:", err);
            return;
        }

        // =========================================================
        // BUTTON HANDLER
        // =========================================================
        if (interaction.isButton()) {

            for (const [id, handler] of client.buttons) {

                // Exact ID match
                if (typeof id === "string" && id === interaction.customId) {
                    return handler.execute(interaction, client, config);
                }

                // Regex match
                if (id instanceof RegExp && id.test(interaction.customId)) {
                    return handler.execute(interaction, client, config);
                }
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ Unknown Button")
                        .setDescription("This button does not have a handler.")
                ],
                ephemeral: true
            });
        }

        // =========================================================
        // SELECT MENU HANDLER
        // =========================================================
        if (interaction.isStringSelectMenu()) {
            console.log("⚡ Select Menu Triggered:", interaction.customId);

            if (interaction.customId === "ticket_menu") {
                // ✅ FIXED PATH
                const panelHandler = require("../commands/panelHandler");
                return panelHandler.execute(interaction, client, config);
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ Unknown Menu")
                        .setDescription("This select menu is not recognized.")
                ],
                ephemeral: true
            });
        }

        // =========================================================
        // SLASH COMMAND HANDLER
        // =========================================================
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ff2e2e")
                            .setTitle("❌ Command Not Found")
                            .setDescription("This slash command does not exist.")
                    ],
                    ephemeral: true
                });
            }

            try {
                await command.execute(interaction, client, config);
            } catch (err) {
                console.error(`❌ Error in /${interaction.commandName}:`, err);

                if (!interaction.replied) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("#ff2e2e")
                                .setTitle("❌ Command Error")
                                .setDescription("Something went wrong while executing this command.")
                        ],
                        ephemeral: true
                    });
                }
            }
        }
    }
};
