const { Client, GatewayIntentBits } = require("discord.js");
const translate = require("@iamtraction/google-translate");
require("dotenv").config();

// Channel IDs to auto-translate
const TRANSLATION_CHANNELS = [
    "1441978786118631485",
    "CHANNEL_ID_2"
];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// AUTO TRANSLATION LOGIC
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!TRANSLATION_CHANNELS.includes(message.channel.id)) return;

    try {
        // SAFEST LANGUAGE DETECTION
        const detection = await translate(message.content, { to: "en" });
        const detectedLang = detection.from.language.iso; // always safe

        // ----------- FRENCH ↔ ENGLISH -----------
        if (detectedLang === "fr") {
            const translated = await translate(message.content, { to: "en" });
            return message.reply(`🇫🇷 → 🇬🇧 **${translated.text}**`);
        }

        if (detectedLang === "en") {
            const translatedFR = await translate(message.content, { to: "fr" });
            const translatedES = await translate(message.content, { to: "es" });

            return message.reply(
                `🇬🇧 → 🇫🇷 **${translatedFR.text}**\n🇬🇧 → 🇪🇸 **${translatedES.text}**`
            );
        }

        // ----------- SPANISH ↔ ENGLISH -----------
        if (detectedLang === "es") {
            const translated = await translate(message.content, { to: "en" });
            return message.reply(`🇪🇸 → 🇬🇧 **${translated.text}**`);
        }

    } catch (err) {
        console.log("Translation Error:", err);
        message.reply("⚠️ Could not translate that message.");
    }
});

client.login(process.env.TOKEN);
