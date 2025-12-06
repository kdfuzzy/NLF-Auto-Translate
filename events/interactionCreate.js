const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {

        const config = loadJSON("./config/config.json");

        // Buttons
        if (interaction.isButton()) {
            const handler = client.buttons.get(interaction.customId);
            if (!handler)
                return interaction.reply({ content: "Button not found.", ephemeral: true });

            return handler.execute(interaction, client, config);
        }

        // Select menus
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === "ticket_menu") {
                const handler = require("../handlers/panelHandler");
                return handler.execute(interaction, client, config);
            }
        }

        // Slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command)
                return interaction.reply({ content: "Command not found.", ephemeral: true });

            try {
                return command.execute(interaction, client, config);
            } catch (err) {
                console.log(err);
                return interaction.reply({
                    content: "Command error.",
                    ephemeral: true
                });
            }
        }
    }
};
