const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        // Reload config every interaction
        client.config = loadJSON("./config/config.json");
        const config = client.config;

        // ------------------------
        // BUTTON HANDLERS
        // ------------------------
        if (interaction.isButton()) {
            const btn = client.buttons.get(interaction.customId);

            if (!btn) {
                console.log("❌ Button not found:", interaction.customId);
                return interaction.reply({ content: "❌ Button error.", ephemeral: true });
            }

            return btn.execute(interaction, client, config);
        }

        // ------------------------
        // SELECT MENU HANDLERS
        // ------------------------
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === "ticket_menu") {
                console.log("🎉 Dropdown selection received!");
                const handler = require("../commands/panelHandler");
                return handler.execute(interaction, client, config);
            }
        }

        // ------------------------
        // SLASH COMMAND HANDLERS
        // ------------------------
        if (interaction.isChatInputCommand()) {
            const cmd = client.commands.get(interaction.commandName);

            if (!cmd) {
                return interaction.reply({ content: "❌ Command not found.", ephemeral: true });
            }

            try {
                return cmd.execute(interaction, client, config);
            } catch (err) {
                console.error(err);
                return interaction.reply({ content: "⚠️ Command error", ephemeral: true });
            }
        }
    }
};
