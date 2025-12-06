const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {

        const config = loadJSON("./config/config.json");

        // ---------------------------------------------------
        // BUTTON HANDLER
        // ---------------------------------------------------
        if (interaction.isButton()) {
            const btn = client.buttons.get(interaction.customId);

            if (!btn) {
                console.log("❌ Button not found:", interaction.customId);
                return interaction.reply({ content: "Button not found.", ephemeral: true });
            }

            return btn.execute(interaction, client, config);
        }

        // ---------------------------------------------------
        // SELECT MENU HANDLER
        // ---------------------------------------------------
        if (interaction.isStringSelectMenu()) {

            console.log("⚡ Select menu triggered:", interaction.customId);

            if (interaction.customId === "ticket_menu") {
                const handler = require("../commands/panelHandler");
                return handler.execute(interaction, client, config);
            }

            return interaction.reply({ content: "Unknown select menu.", ephemeral: true });
        }

        // ---------------------------------------------------
        // SLASH COMMAND HANDLER
        // ---------------------------------------------------
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return interaction.reply({ content: "Command not found!", ephemeral: true });
            }

            try {
                return command.execute(interaction, client, config);
            } catch (err) {
                console.log("❌ Command Error:", err);
                return interaction.reply({ content: "Command failed.", ephemeral: true });
            }
        }
    }
};
