const { loadJSON, saveJSON } = require("./fileManager");

module.exports = (client) => {
    console.log("⏳ Weekly reset timer started...");

    setInterval(() => {
        const now = new Date();

        // Monday 00:00 UTC
        if (now.getUTCDay() === 1 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {

            console.log("🔁 Performing weekly reset...");

            // -----------------------
            // RESET MESSAGE COUNTS
            // -----------------------
            let messages = loadJSON("./stats/messages.json");
            for (const user of Object.keys(messages)) {
                messages[user].weekly = 0;
            }
            saveJSON("./stats/messages.json", messages);

            // -----------------------
            // RESET TICKET COUNTS
            // -----------------------
            let tickets = loadJSON("./stats/tickets.json");
            for (const user of Object.keys(tickets)) {
                tickets[user].weekly = 0;
            }
            saveJSON("./stats/tickets.json", tickets);

            console.log("✅ Weekly stats reset completed.");
        }

    }, 60 * 1000); // check every minute
};
