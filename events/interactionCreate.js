const { Events, EmbedBuilder } = require("discord.js");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {

        // Reload config every interaction
        const config = loadJSON("./config/config.json");

        // =========================================================
        // BUTTON HANDLER
        // =========================================================
        if (interaction.isButton()) {

            // Loop through button handlers
            for (const [id, handler] of client.buttons) {

                // 1️⃣ Exact match (example: "claim_ticket")
                if (typeof id === "string" && id === interaction.customId) {
                    return handler.execute(interaction, client, config);
                }

                // 2️⃣ Regex match (example: /^alt_ban_/)
                if (id instanceof RegExp && id.test(interaction.customId)) {
                    return handler.execute(interaction, client, config);
                }
            }

            // If button has no handler
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
                const panelHandler = require("../handlers/panelHandler");
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
                return await command.execute(interaction, client, config);

            } catch (err) {
                console.error("❌ Slash Command Error:", err);

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ff2e2e")
                            .setTitle("❌ Command Execution Failed")
                            .setDescription("An internal error occurred while running this command.")
                    ],
                    ephemeral: true
                });
            }
        }

        // =========================================================
        // OTHER INTERACTION TYPES (future-safe)
        // =========================================================
        return;
    }
};
