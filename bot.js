// -------------------------------------
// IMPORTS & CLIENT SETUP
// -------------------------------------
const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    Partials,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    Routes
} = require("discord.js");

const { REST } = require("@discordjs/rest");
const fs = require("fs");
const translate = require("@iamtraction/google-translate");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// -------------------------------------
// CONFIG FILE
// -------------------------------------
const CONFIG_PATH = "./config.json";

let config = {
    transcriptChannel: null,
    ticketCategory: "1441860083402281013"
};

if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4));
} else {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH));
}

// -------------------------------------
// AUTO-TRANSLATE CHANNELS
// -------------------------------------
const TRANSLATION_CHANNELS = [
    "1441978786118631485"
];

// -------------------------------------
// REGISTER SLASH COMMANDS
// -------------------------------------
const commands = [
    new SlashCommandBuilder()
        .setName("panel")
        .setDescription("Send the dropdown ticket panel"),

    new SlashCommandBuilder()
        .setName("claim")
        .setDescription("Claim the ticket"),

    new SlashCommandBuilder()
        .setName("unclaim")
        .setDescription("Unclaim the ticket"),

    new SlashCommandBuilder()
        .setName("close")
        .setDescription("Close the ticket"),

    new SlashCommandBuilder()
        .setName("rename")
        .setDescription("Rename the ticket channel")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("New channel name")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("assigncategory")
        .setDescription("Move ticket to another category")
        .addStringOption(option =>
            option.setName("categoryid")
                .setDescription("Category ID")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("transcript")
        .setDescription("Generate transcript for this ticket"),

    new SlashCommandBuilder()
        .setName("settranscriptchannel")
        .setDescription("Set the transcript storage channel")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Channel to store transcripts in")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Set up server configuration automatically"),

    new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translate any text to any language")
        .addStringOption(option =>
            option.setName("text")
                .setDescription("Text to translate")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("to")
                .setDescription("Target language code (en, fr, es...)")
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

// REST Register
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Register commands globally
    await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
    );

    console.log("Slash commands registered.");
});


// -------------------------------------
// /PANEL — Sends Ticket Panel
// -------------------------------------
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "panel") {

        const menu = new StringSelectMenuBuilder()
            .setCustomId("ticket_menu")
            .setPlaceholder("Select ticket type…")
            .addOptions([
                { label: "Join NLF", value: "join" },
                { label: "Allie Request", value: "allie" },
                { label: "Report / Support", value: "support" },
                { label: "Staff Applications", value: "staff" }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            content: "🎫 **Open a ticket using the dropdown below**",
            components: [row]
        });
    }
});

// -------------------------------------
// TICKET CREATION — Dropdown Handler
// -------------------------------------
client.on("interactionCreate", async i => {
    if (!i.isStringSelectMenu()) return;
    if (i.customId !== "ticket_menu") return;

    const type = i.values[0];
    const user = i.user;

    const channel = await i.guild.channels.create({
        name: `ticket-${user.username}`.toLowerCase(),
        type: 0,
        parent: config.ticketCategory,
        permissionOverwrites: [
            {
                id: i.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: user.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory
                ]
            },
            {
                id: client.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel]
            }
        ]
    });

    await i.reply({ content: `🎫 Ticket created: ${channel}`, ephemeral: true });

    channel.send(
        `🎟 **Ticket Type:** ${type.toUpperCase()}\n👋 Welcome <@${user.id}>!\nPlease explain your issue below.`
    );
});

// -------------------------------------
// CLAIM COMMAND
// -------------------------------------
client.on("interactionCreate", async i => {
    if (!i.isChatInputCommand()) return;

    if (i.commandName === "claim") {
        const member = i.member;
        const channel = i.channel;

        if (!channel.name.startsWith("ticket-"))
            return i.reply({ content: "❌ Not a ticket.", ephemeral: true });

        if (channel.topic && channel.topic.includes("CLAIMED"))
            return i.reply({ content: "❌ Already claimed.", ephemeral: true });

        await channel.setTopic(`CLAIMED BY ${member.user.tag}`);

        await i.reply(`🟦 Ticket claimed by <@${member.id}>`);
    }
});


// -------------------------------------
// UNCLAIM COMMAND
// -------------------------------------
client.on("interactionCreate", async i => {
    if (!i.isChatInputCommand()) return;

    if (i.commandName === "unclaim") {
        const channel = i.channel;

        if (!channel.name.startsWith("ticket-"))
            return i.reply({ content: "❌ Not a ticket.", ephemeral: true });

        await channel.setTopic(null);

        await i.reply(`🔄 Ticket unclaimed.`);
    }
});


// -------------------------------------
// RENAME COMMAND
// -------------------------------------
client.on("interactionCreate", async i => {
    if (!i.isChatInputCommand()) return;

    if (i.commandName === "rename") {
        const newName = i.options.getString("name");

        if (!i.channel.name.startsWith("ticket-"))
            return i.reply({ content: "❌ Not a ticket.", ephemeral: true });

        await i.channel.setName(newName);

        await i.reply(`✏ Ticket renamed to **${newName}**`);
    }
});


// -------------------------------------
// ASSIGN CATEGORY
// -------------------------------------
client.on("interactionCreate", async i => {
    if (!i.isChatInputCommand()) return;

    if (i.commandName === "assigncategory") {
        const categoryID = i.options.getString("categoryid");

        await i.channel.setParent(categoryID);

        await i.reply(`📂 Ticket moved to <#${categoryID}>`);
    }
});


// -------------------------------------
// CLOSE TICKET
// -------------------------------------
client.on("interactionCreate", async i => {
    if (!i.isChatInputCommand()) return;

    if (i.commandName === "close") {
        if (!i.channel.name.startsWith("ticket-"))
            return i.reply({ content: "❌ Not a ticket.", ephemeral: true });

        await i.reply("🔒 Ticket closing in 3 seconds...");

        setTimeout(() => {
            i.channel.delete();
        }, 3000);
    }
});


// -------------------------------------
// TRANSCRIPT SYSTEM
// -------------------------------------
client.on("interactionCreate", async i => {
    if (!i.isChatInputCommand()) return;

    if (i.commandName === "transcript") {
        if (!i.channel.name.startsWith("ticket-"))
            return i.reply({ content: "❌ Not a ticket.", ephemeral: true });

        const messages = await i.channel.messages.fetch({ limit: 100 });
        const transcriptData = messages
            .reverse()
            .map(m => `${m.author.tag}: ${m.content}`)
            .join("\n");

        const filePath = `./transcript-${i.channel.id}.txt`;
        fs.writeFileSync(filePath, transcriptData);

        const transcriptChannel = config.transcriptChannel;

        if (!transcriptChannel)
            return i.reply("❌ Transcript channel not set.");

        const channel = i.guild.channels.cache.get(transcriptChannel);
        await channel.send({ content: "📄 Ticket Transcript:", files: [filePath] });

        await i.reply("📨 Transcript sent.");
    }
});


// -------------------------------------
// SET TRANSCRIPT CHANNEL
// -------------------------------------
client.on("interactionCreate", async i => {
    if (!i.isChatInputCommand()) return;

    if (i.commandName === "settranscriptchannel") {
        const ch = i.options.getChannel("channel");

        config.transcriptChannel = ch.id;
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4));

        i.reply(`📁 Transcripts will now be saved in <#${ch.id}>`);
    }
});


// -------------------------------------
// SETUP COMMAND
// -------------------------------------
client.on("interactionCreate", async i => {
    if (!i.isChatInputCommand()) return;

    if (i.commandName === "setup") {
        config.ticketCategory = "1441860083402281013";
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4));

        i.reply("✅ Setup complete. Ticket system ready.");
    }
});


// -------------------------------------
// SLASH /TRANSLATE
// -------------------------------------
client.on("interactionCreate", async i => {
    if (!i.isChatInputCommand()) return;
    if (i.commandName !== "translate") return;

    const text = i.options.getString("text");
    const to = i.options.getString("to");

    try {
        const result = await translate(text, { to });
        i.reply(`**Translated (${to}):** ${result.text}`);
    } catch {
        i.reply("❌ Could not translate.");
    }
});


// -------------------------------------
// AUTO TRANSLATE SYSTEM
// -------------------------------------
client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (!TRANSLATION_CHANNELS.includes(message.channel.id)) return;

    try {
        const detection = await translate(message.content, { to: "en" });
        const lang = detection.from.language.iso;

        if (lang === "fr") {
            const en = await translate(message.content, { to: "en" });
            return message.reply(`🇫🇷 → 🇬🇧 **${en.text}**`);
        }

        if (lang === "en") {
            const fr = await translate(message.content, { to: "fr" });
            const es = await translate(message.content, { to: "es" });

            return message.reply(
                `🇬🇧 → 🇫🇷 **${fr.text}**\n🇬🇧 → 🇪🇸 **${es.text}**`
            );
        }

        if (lang === "es") {
            const en = await translate(message.content, { to: "en" });
            return message.reply(`🇪🇸 → 🇬🇧 **${en.text}**`);
        }
    } catch {
        message.reply("⚠️ Could not translate message.");
    }
});

// -------------------------------------

client.login(process.env.TOKEN);
