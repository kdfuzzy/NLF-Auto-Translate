const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        // Reload config every interaction to keep changes live
        client.config = loadJSON("./config/config.json");
        const config = client.config;

        // ---------------------------
        // BUTTON HANDLERS
        // ---------------------------
        if (interaction.isButton()) {
            const btn = client.buttons.get(interaction.customId);
            if (!btn) return;

            try {
                await btn.execute(interaction, client, config);
            } catch (err) {
                console.log(err);
                interaction.reply({ content: "❌ Button error.", ephemeral: true });
            }
            return;
        }

        // ---------------------------
        // SELECT MENU HANDLERS
        // (Ticket panel dropdown)
        // ---------------------------
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === "ticket_menu") {
                const ticketPanel = require("../commands/panelHandler");
                return ticketPanel.execute(interaction, client, config);
            }
        }

        // ---------------------------
        // SLASH COMMAND HANDLERS
        // ---------------------------
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return interaction.reply({ content: "❌ Command not found.", ephemeral: true });
            }

            try {
                await command.execute(interaction, client, config);
            } catch (error) {
                console.error(error);
                interaction.reply({ content: "❌ Command execution error.", ephemeral: true });
            }
        }
    }
};
