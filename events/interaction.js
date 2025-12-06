const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {

        const config = loadJSON("./config/config.json");

        // ----------------------------------
        // BUTTONS
        // ----------------------------------
        if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);

            if (!button) {
                console.log("❌ Button not found:", interaction.customId);
                return interaction.reply({ content: "Button not found.", ephemeral: true });
            }

            try {
                return button.execute(interaction, client, config);
            } catch (err) {
                console.error(err);
                return interaction.reply({ content: "Button error.", ephemeral: true });
            }
        }

        // ----------------------------------
        // SELECT MENUS
        // ----------------------------------
        if (interaction.isStringSelectMenu()) {

            console.log("📥 Select Menu Triggered:", interaction.customId);

            if (interaction.customId === "ticket_menu") {
                try {
                    const handler = require("../commands/panelHandler");
                    return handler.execute(interaction, client, config);
                } catch (err) {
                    console.error(err);
                    return interaction.reply({ content: "Select menu error.", ephemeral: true });
                }
            }

            return interaction.reply({ content: "Unknown menu.", ephemeral: true });
        }

        // ----------------------------------
        // SLASH COMMANDS
        // ----------------------------------
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return interaction.reply({ content: "Command not found.", ephemeral: true });
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
