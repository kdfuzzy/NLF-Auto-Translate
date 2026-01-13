const { Events, EmbedBuilder } = require("discord.js");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {

        // Reload config every interaction (safe + simple)
        const config = loadJSON("./config/config.json");

        // =========================================================
        // BUTTON HANDLER
        // =========================================================
        if (interaction.isButton()) {

            // 1️⃣ Giveaway button (special case)
            const giveawayCommand = client.commands.get("giveaway");
            if (giveawayCommand?.button) {
                await giveawayCommand.button(interaction);
                return;
            }

            // 2️⃣ Loop through registered button handlers
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

            // Unknown button
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#ff2e2e")
                        .setTitle("❌ Unknown Button")
                        .setDescription("This button is no longer valid or has no handler.")
                ],
                ephemeral: true
            });
        }

        // =========================================================
        // SELECT MENU HANDLER
        // =========================================================
        if (interaction.isStringSelectMenu()) {

            // Ticket panel menu
            if (interaction.customId === "ticket_menu") {
                const panelHandler = require("../handlers/panelHandler");
                return panelHandler.execute(interaction, client, config);
            }

            // Unknown menu
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
            } catch (error) {
                console.error(`❌ Error in /${interaction.commandName}:`, error);

                if (interaction.replied || interaction.deferred) {
                    return interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("#ff2e2e")
                                .setTitle("❌ Command Failed")
                                .setDescription("An internal error occurred while running this command.")
                        ],
                        ephemeral: true
                    });
                }

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#ff2e2e")
                            .setTitle("❌ Command Failed")
                            .setDescription("An internal error occurred while running this command.")
                    ],
                    ephemeral: true
                });
            }
        }

        // =========================================================
        // FUTURE-SAFE (MODALS, AUTOCOMPLETE, ETC)
        // =========================================================
        return;
    }
};
