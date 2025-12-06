// -------------------------
// Clean Discord Bot Loader
// -------------------------
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require("discord.js");
require("dotenv").config();

// -------------------------
// CLIENT SETUP
// -------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// Collections to store commands & buttons
client.commands = new Collection();
client.buttons = new Collection();

// Load config
client.config = JSON.parse(fs.readFileSync("./config/config.json", "utf8"));

// -------------------------
// LOAD COMMANDS
// -------------------------
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

let slashCommands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    if (!command.data) {
        console.log(`⚠️ Skipped ${file}: missing "data" property.`);
        continue;
    }

    client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
}

console.log(`📦 Loaded ${client.commands.size} slash commands.`);

// -------------------------
// LOAD BUTTONS
// -------------------------
const buttonsPath = path.join(__dirname, "buttons");
if (fs.existsSync(buttonsPath)) {
    const buttonFiles = fs.readdirSync(buttonsPath).filter(f => f.endsWith(".js"));

    for (const file of buttonFiles) {
        const button = require(`./buttons/${file}`);

        if (!button.id) {
            console.log(`⚠️ Skipped button ${file}: missing "id".`);
            continue;
        }

        client.buttons.set(button.id, button);
    }

    console.log(`🔘 Loaded ${client.buttons.size} button handlers.`);
} else {
    console.log("⚠️ No /buttons folder found. Skipping button loading.");
}

// -------------------------
// LOAD EVENTS
// -------------------------
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    if (!event.name || !event.execute) {
        console.log(`⚠️ Skipped event ${file}: missing name/execute.`);
        continue;
    }

    client.on(event.name, (...args) => event.execute(...args, client));
}

console.log(`📡 Loaded ${eventFiles.length} events.`);

// -------------------------
// REGISTER SLASH COMMANDS
// -------------------------
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🔄 Registering slash commands...");

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: slashCommands }
        );

        console.log("✅ Slash commands registered!");
    } catch (err) {
        console.error("❌ Error registering commands:", err);
    }
})();

// -------------------------
// BOT READY
// -------------------------
client.once("ready", () => {
    console.log(`🟢 Logged in as ${client.user.tag}`);
});

// -------------------------
// LOGIN
// -------------------------
client.login(process.env.TOKEN);
