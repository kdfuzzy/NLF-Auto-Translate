const translate = require("@iamtraction/google-translate");
const { loadJSON, saveJSON } = require("../utils/fileManager");

module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (message.author.bot) return;

        // Reload config
        const config = loadJSON("./config/config.json");

        //
        // ------------------------------
        // MESSAGE TRACKING SYSTEM
        // ------------------------------
        //
        let stats = loadJSON("./stats/messages.json");
        const id = message.author.id;

        if (!stats[id]) {
            stats[id] = { daily: 0, weekly: 0, all: 0 };
        }

        stats[id].daily++;
        stats[id].weekly++;
        stats[id].all++;

        saveJSON("./stats/messages.json", stats);

        //
        // ------------------------------
        // AUTO TRANSLATE SYSTEM
        // ------------------------------
        //
        if (!config.translateChannels.includes(message.channel.id)) return;

        try {
            // detect language
            const detection = await translate(message.content, { to: "en" });
            const lang = detection.from.language.iso;

            // French → English
            if (lang === "fr") {
                const en = await translate(message.content, { to: "en" });
                return message.reply(`🇫🇷 → 🇬🇧 **${en.text}**`);
            }

            // English → French & Spanish
            if (lang === "en") {
                const fr = await translate(message.content, { to: "fr" });
                const es = await translate(message.content, { to: "es" });

                return message.reply(
                    `🇬🇧 → 🇫🇷 **${fr.text}**\n🇬🇧 → 🇪🇸 **${es.text}**`
                );
            }

            // Spanish → English
            if (lang === "es") {
                const en = await translate(message.content, { to: "en" });
                return message.reply(`🇪🇸 → 🇬🇧 **${en.text}**`);
            }
        } catch (err) {
            message.reply("⚠️ Could not translate that.");
        }
    }
};
