const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");

module.exports = {
    name: "guildMemberAdd",

    async execute(member, client) {
        const config = client.config;
        const logChannel = member.guild.channels.cache.get(config.altLogChannel);
        if (!logChannel) return;

        const now = Date.now();
        const created = member.user.createdTimestamp;

        const ageDays = Math.floor((now - created) / 86400000);

        let suspicion = 0;
        let reasons = [];

        // Suspicion scoring system
        if (ageDays < 7) {
            suspicion += 40;
            reasons.push("Account less than **7 days** old");
        }

        if (!member.user.avatar) {
            suspicion += 20;
            reasons.push("Default profile picture");
        }

        if (member.user.username.match(/alt|backup|test|fake|123/i)) {
            suspicion += 20;
            reasons.push("Suspicious username pattern");
        }

        if (member.user.discriminator === "0000") {
            suspicion += 10;
            reasons.push("Zero discriminator username");
        }

        if (member.user.bot) {
            suspicion += 25;
            reasons.push("Bot-like creation pattern");
        }

        // Auto-kick if enabled
        if (config.autoKickUnderDays > 0 && ageDays < config.autoKickUnderDays) {
            member.kick("Auto alt-kick: Account too new");
        }

        // Save logs
        let altLogs = {};
        try {
            altLogs = JSON.parse(fs.readFileSync("./stats/altLogs.json"));
        } catch (err) {}

        altLogs[member.id] = {
            username: member.user.tag,
            userId: member.id,
            suspicion,
            reasons,
            ageDays,
            joinedAt: Date.now()
        };

        fs.writeFileSync("./stats/altLogs.json", JSON.stringify(altLogs, null, 2));

        // Embed message
        const embed = new EmbedBuilder()
            .setColor(suspicion >= 50 ? "Red" : "Yellow")
            .setTitle("🚨 Possible ALT Detected")
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: "User", value: `${member.user.tag} (${member.id})` },
                { name: "Account Age", value: `${ageDays} days`, inline: true },
                { name: "Suspicion Score", value: `${suspicion}%`, inline: true },
                { name: "Reasons", value: reasons.join("\n") || "No issues" }
            )
            .setTimestamp();

        // Buttons for staff
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`alt_ban_${member.id}`)
                .setLabel("Ban User")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId(`alt_kick_${member.id}`)
                .setLabel("Kick User")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(`alt_ignore_${member.id}`)
                .setLabel("Ignore Alert")
                .setStyle(ButtonStyle.Success)
        );

        logChannel.send({ embeds: [embed], components: [buttons] });
    }
};
