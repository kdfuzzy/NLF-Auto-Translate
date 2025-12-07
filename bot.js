// -------------------------------
// MAIN BOT LOADER
// -------------------------------
const fs = require("fs");
const path = require("path");
const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    Collection, 
    REST, 
    Routes 
} = require("discord.js");

require("dotenv").config();

// -------------------------------
// CLIENT SETUP
// -------------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// Collections
client.commands = new Collection();
client.buttons = new Collection();

// -------------------------------
// CONFIG LOADING
// -------------------------------
const loadConfig = () => JSON.parse(fs.readFileSync("./config/config.json"));
client.config = loadConfig();

// -----------------------------------------------------
// LOAD COMMANDS
// -----------------------------------------------------
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

let slashCommands = [];

console.log("COMMAND FILES FOUND:", commandFiles);

for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);

        if (!command.data) {
            console.log(`⚠️ Skipped ${file}: missing "data" property.`);
            continue;
        }

        client.commands.set(command.data.name, command);
        slashCommands.push(command.data.toJSON());
    } catch (err) {
        console.log(`❌ Error loading command ${file}:`, err);
    }
}

console.log("COMMANDS LOADED:", [...client.commands.keys()]);
console.log(`📦 Loaded ${client.commands.size} slash commands.`);

// -----------------------------------------------------
// LOAD BUTTON HANDLERS
// -----------------------------------------------------
const buttonsPath = path.join(__dirname, "buttons");
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith(".js"));

for (const file of buttonFiles) {
    try {
        const button = require(`./buttons/${file}`);

        // Button.id can be string OR RegExp
        if (!button.id) {
            console.log(`⚠️ Button "${file}" missing ID`);
            continue;
        }

        client.buttons.set(button.id, button);
    } catch (err) {
        console.log(`❌ Error loading button ${file}:`, err);
    }
}

console.log(`🔘 Loaded ${client.buttons.size} button handlers.`);

// -----------------------------------------------------
// LOAD EVENTS
// -----------------------------------------------------
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    try {
        const event = require(`./events/${file}`);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    } catch (err) {
        console.log(`❌ Error loading event ${file}:`, err);
    }
}

console.log(`📡 Loaded ${eventFiles.length} events.`);

// -----------------------------------------------------
// REGISTER SLASH COMMANDS
// -----------------------------------------------------
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("🔄 Registering slash commands...");
        console.log("Commands being registered:", slashCommands.map(c => c.name));

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: slashCommands }
        );

        console.log("✅ Successfully registered slash commands!");
    } catch (err) {
        console.error("❌ Error registering commands:", err);
    }
})();

// -----------------------------------------------------
// LOGIN BOT
// -----------------------------------------------------
client.login(process.env.TOKEN);
