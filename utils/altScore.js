// utils/altScore.js

module.exports = function altScore(user) {
    let suspicion = 0;
    let reasons = [];

    const accountAgeDays = Math.floor((Date.now() - user.createdTimestamp) / 86400000);

    // Account < 7 days old
    if (accountAgeDays < 7) {
        suspicion += 40;
        reasons.push("Account younger than 7 days");
    }

    // Default avatar
    if (!user.avatar) {
        suspicion += 20;
        reasons.push("Default profile picture");
    }

    // Username patterns
    if (user.username.match(/alt|backup|test|fake|123|sus|bot/i)) {
        suspicion += 20;
        reasons.push("Suspicious username pattern");
    }

    // Zero discriminator (new Discord usernames)
    if (user.discriminator === "0000") {
        suspicion += 5;
    }

    // Bot-like pattern
    if (user.bot) {
        suspicion += 25;
        reasons.push("User is a bot");
    }

    return {
        suspicion,
        reasons,
        accountAgeDays
    };
};
