const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {

        const config = loadJSON("./config/config.json");

        // -------------------------------------
        // BUTTON HANDLERS
        // -------------------------------------
        if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);

            if (!button) {
                console.log("❌ Button not found:", interaction.customId);
                return interaction.reply({ content: "Button not found.", ephemeral: true });
            }

            return button.execute(interaction, client, config);
        }

        // -------------------------------------
        // SELECT MENU HANDLERS
        // -------------------------------------
        if (interaction.isStringSelectMenu()) {

            console.log("⚡ Select menu triggered:", interaction.customId);

            if (interaction.customId === "ticket_menu") {
                const handler = require("../commands/panelHandler");
                return handler.execute(interaction, client, config);
            }

            return interaction.reply({
                content: "Unknown menu.",
                ephemeral: true
            });
        }

        // -------------------------------------
        // SLASH COMMAND HANDLERS
        // -------------------------------------
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command)
                return interaction.reply({ content: "Command not found.", ephemeral: true });

            try {
                return command.execute(interaction, client, config);
            } catch (err) {
                console.error(err);
                return interaction.reply({
                    content: "Error executing command.",
                    ephemeral: true
                });
            }
        }
    }
};
