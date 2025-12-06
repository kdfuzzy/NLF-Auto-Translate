// -------------------------------
// MAIN BOT LOADER
// -------------------------------
const fs = require("fs");
const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require("discord.js");
require("dotenv").config();

// -------------------------------
// CLIENT SETUP
// -------------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// Collections
client.commands = new Collection();
client.buttons = new Collection();

// -------------------------------
// LOAD CONFIG
// -------------------------------
const loadConfig = () => JSON.parse(fs.readFileSync("./config/config.json"));
client.config = loadConfig();

// -------------------------------
// LOAD COMMANDS
// -------------------------------
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
let slashCommands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (!command.data) {
        console.log(`⚠️ Command "${file}" missing data`);
        continue;
    }
    client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
}

console.log(`📦 Loaded ${client.commands.size} commands.`);

// -------------------------------
// LOAD BUTTON HANDLERS
// -------------------------------
const buttonFiles = fs.readdirSync("./buttons").filter(f => f.endsWith(".js"));

for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    if (!button.id) {
        console.log(`⚠️ Button "${file}" missing ID`);
        continue;
    }
    client.buttons.set(button.id, button);
}

console.log(`🔘 Loaded ${client.buttons.size} button handlers.`);

// -------------------------------
// LOAD EVENTS
// -------------------------------
const eventFiles = fs.readdirSync("./events").filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

console.log(`📡 Loaded ${eventFiles.length} events.`);

// -------------------------------
// REGISTER SLASH COMMANDS
// -------------------------------
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

// -------------------------------
// LOGIN
// -------------------------------
client.login(process.env.TOKEN);
