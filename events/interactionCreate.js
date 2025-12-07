const { Events } = require("discord.js");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        // Always reload config on each interaction
        const config = loadJSON("./config/config.json");

        // -------------------------------
        // BUTTON HANDLER
        // -------------------------------
        if (interaction.isButton()) {

            // Loop through all button handlers
            for (const [id, handler] of client.buttons) {

                // Exact ID match (ex: "claim_ticket")
                if (typeof id === "string" && id === interaction.customId) {
                    return handler.execute(interaction, client, config);
                }

                // Regex match (ex: /^alt_ban_/)
                if (id instanceof RegExp && id.test(interaction.customId)) {
                    return handler.execute(interaction, client, config);
                }
            }

            return interaction.reply({
                content: "❌ Unknown button.",
                ephemeral: true
            });
        }

        // -------------------------------
        // SELECT MENU HANDLER
        // -------------------------------
        if (interaction.isStringSelectMenu()) {
            console.log("⚡ Select Menu Triggered:", interaction.customId);

            if (interaction.customId === "ticket_menu") {
                const handler = require("../handlers/panelHandler.js");
                return handler.execute(interaction, client, config);
            }

            return interaction.reply({
                content: "❌ Unknown select menu.",
                ephemeral: true
            });
        }

        // -------------------------------
        // SLASH COMMAND HANDLER
        // -------------------------------
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return interaction.reply({
                    content: "❌ Command not found!",
                    ephemeral: true
                });
            }

            try {
                return await command.execute(interaction, client, config);
            } catch (err) {
                console.error("❌ Slash Command Error:", err);

                return interaction.reply({
                    content: "❌ Something went wrong while executing the command.",
                    ephemeral: true
                });
            }
        }
    }
};
