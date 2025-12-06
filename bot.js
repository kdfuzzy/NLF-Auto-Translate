const fs = require("fs");
const { Client, GatewayIntentBits, Partials, Collection, REST, Routes } = require("discord.js");
require("dotenv").config();

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

// Load config
client.config = JSON.parse(fs.readFileSync("./config/config.json"));

// Load commands
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
let slashCommands = [];

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (!command.data) continue;

    client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
}

// Load button handlers
const buttonFiles = fs.readdirSync("./buttons").filter(f => f.endsWith(".js"));
for (const file of buttonFiles) {
    const button = require(`./buttons/${file}`);
    if (!button.id) continue;
    client.buttons.set(button.id, button);
}

// Load events
const eventFiles = fs.readdirSync("./events").filter(f => f.endsWith(".js"));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    client.on(event.name, (...args) => event.execute(...args, client));
}

// Register commands
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
(async () => {
    try {
        console.log("Registering slash commands…");
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: slashCommands }
        );
        console.log("Commands registered!");
    } catch (err) {
        console.error(err);
    }
})();

// Login
client.login(process.env.TOKEN);
