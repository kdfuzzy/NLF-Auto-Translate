// ===============================
// NLF BOT — ADVANCED ANTI-ALT SYSTEM
// ===============================
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");

// Load config
const loadConfig = () => JSON.parse(fs.readFileSync("./config/config.json"));
let config = loadConfig();

// Load persistent alt database
const ALTDATABASE_PATH = "./stats/altdb.json";
if (!fs.existsSync(ALTDATABASE_PATH)) {
    fs.writeFileSync(ALTDATABASE_PATH, JSON.stringify({ users: {}, joinHistory: [] }, null, 2));
}
const loadAltDB = () => JSON.parse(fs.readFileSync(ALTDATABASE_PATH));
const saveAltDB = (db) => fs.writeFileSync(ALTDATABASE_PATH, JSON.stringify(db, null, 2));

// Blacklisted username patterns
const bannedNamePatterns = [
    /raid/i,
    /bot/i,
    /spam/i,
    /nlfhater/i,
    /scam/i,
    /fake/i,
    /^user[0-9]{5,}$/i,
    /^[a-z]{6,10}$/i // random letters
];

// Join-wave storage
let recentJoins = [];

// ===============================
// MAIN ANTI-ALT EVENT
// ===============================
module.exports = {
    name: "guildMemberAdd",

    async execute(member) {

        config = loadConfig();
        let altDB = loadAltDB();

        const logChannel = member.guild.channels.cache.get(config.altLogChannel);
        if (!logChannel) return console.log("⚠ altLogChannel invalid.");

        const now = Date.now();
        const user = member.user;

        let suspicion = 0;
        let reasons = [];

        // ===========================
        // 1. ACCOUNT AGE CHECK
        // ===========================
        const accountAgeDays = (now - user.createdTimestamp) / (1000 * 60 * 60 * 24);

        if (accountAgeDays < 1) { suspicion += 40; reasons.push("Account younger than 1 day"); }
        else if (accountAgeDays < 3) { suspicion += 25; reasons.push("Account younger than 3 days"); }
        else if (accountAgeDays < 7) { suspicion += 10; reasons.push("Account younger than 7 days"); }

        // ===========================
        // 2. USERNAME BLACKLIST
        // ===========================
        for (const pattern of bannedNamePatterns) {
            if (pattern.test(user.username)) {
                suspicion += 30;
                reasons.push(`Suspicious username: ${user.username}`);
                break;
            }
        }

        // ===========================
        // 3. AVATAR SIMILARITY (HASH)
        // ===========================
        const avatarHash = user.avatar;

        if (avatarHash) {
            let matches = Object.values(altDB.users).filter(u => u.avatarHash === avatarHash);
            if (matches.length >= 1) {
                suspicion += 25;
                reasons.push("Avatar similarity to known users");
            }
        } else {
            // Default gray avatar
            suspicion += 10;
            reasons.push("Default avatar");
        }

        // ===========================
        // 4. BANNER SIMILARITY
        // ===========================
        const bannerHash = user.banner;

        if (!bannerHash) {
            suspicion += 5; // No banner = lower trust
            reasons.push("No banner");
        } else {
            let matches = Object.values(altDB.users).filter(u => u.bannerHash === bannerHash);
            if (matches.length >= 1) {
                suspicion += 15;
                reasons.push("Banner matches previous users");
            }
        }

        // ===========================
        // 5. JOIN-WAVE DETECTION
        // ===========================
        recentJoins.push(now);
        recentJoins = recentJoins.filter(t => now - t < 15000); // 15 sec window

        if (recentJoins.length >= 4) {
            suspicion += 35;
            reasons.push("Join-wave detected (multiple joins within 15 seconds)");
        }

        // ===========================
        // 6. CLUSTER DETECTION
        // ===========================
        const usersWithCloseAge = Object.values(altDB.users).filter(u => {
            return Math.abs(u.createdTimestamp - user.createdTimestamp) < (1000 * 60 * 60 * 2);
        });

        if (usersWithCloseAge.length >= 3) {
            suspicion += 30;
            reasons.push("Account age cluster detected (multiple accounts created close together)");
        }

        // ===========================
        // 7. SIMULATED IP PATTERN (LEGAL)
        // Based on:
        // - Username length
        // - Avatar default + age
        // - Speed of joining after creation
        // ===========================
        if (accountAgeDays < 1 && !avatarHash) {
            suspicion += 20;
            reasons.push("High-risk pattern: new + no avatar");
        }

        if (accountAgeDays < 2 && usersWithCloseAge.length >= 2) {
            suspicion += 20;
            reasons.push("Possible multi-alt generation burst");
        }

        // ===========================
        // 8. PERSISTENT DATABASE SAVE
        // ===========================
        altDB.users[user.id] = {
            id: user.id,
            tag: user.tag,
            username: user.username,
            createdTimestamp: user.createdTimestamp,
            avatarHash: avatarHash,
            bannerHash: bannerHash,
            lastJoin: now,
            suspicionReported: suspicion
        };

        saveAltDB(altDB);

        // ===========================
        // BUILD STAFF REVIEW PANEL EMBED
        // ===========================
        const embed = new EmbedBuilder()
            .setColor(suspicion >= 70 ? "Red" : suspicion >= 40 ? "Yellow" : "Green")
            .setTitle("🚨 Suspicious User Detected")
            .addFields(
                { name: "User", value: `<@${user.id}> (\`${user.tag}\`)`, inline: true },
                { name: "Account Age", value: `${accountAgeDays.toFixed(2)} days`, inline: true },
                { name: "Suspicion Score", value: `${suspicion}`, inline: true },
                { name: "Reasons", value: reasons.length ? reasons.join("\n") : "No serious flags." }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        // ===========================
        // STAFF BUTTONS
        // ===========================
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`alt_ban_${user.id}`)
                .setLabel("Ban User")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId(`alt_kick_${user.id}`)
                .setLabel("Kick User")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`alt_ignore_${user.id}`)
                .setLabel("Ignore")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(`alt_safe_${user.id}`)
                .setLabel("Mark Safe")
                .setStyle(ButtonStyle.Success)
        );

        // Send embed
        await logChannel.send({ embeds: [embed], components: [buttons] });
    }
};
