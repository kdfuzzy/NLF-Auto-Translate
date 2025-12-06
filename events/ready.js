const weeklyReset = require("../utils/weeklyReset");
const { loadJSON } = require("../utils/fileManager");

module.exports = {
    name: "ready",
    once: true,

    async execute(client) {
        console.log(`✅ Logged in as ${client.user.tag}`);

        // Load config for global use
        const config = loadJSON("./config/config.json");
        client.config = config;

        // Start weekly reset timer
        weeklyReset(client);

        console.log("📅 Weekly reset system running");
        console.log("🟦 Bot is fully online");
    }
};

