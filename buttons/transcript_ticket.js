const fs = require("fs");

module.exports = {
    id: "transcript_ticket",

    async execute(interaction, client, config) {
        const member = interaction.member;

        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id))) {
            return interaction.reply({ content: "❌ Only staff can create transcripts.", ephemeral: true });
        }

        const channel = interaction.channel;

        // Fetch last 100 messages
        const messages = await channel.messages.fetch({ limit: 100 });
        const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        let transcriptText = "";
        sorted.forEach(msg => {
            transcriptText += `${msg.author.tag}: ${msg.content}\n`;
        });

        // Save to temporary file
        const filename = `transcript-${channel.id}.txt`;
        fs.writeFileSync(filename, transcriptText);

        // Send transcript to transcript channel
        const tc = interaction.guild.channels.cache.get(config.transcriptChannel);

        if (!tc) {
            return interaction.reply({ content: "❌ Transcript channel is not set.", ephemeral: true });
        }

        await tc.send({ content: `📄 Transcript for ${channel.name}`, files: [filename] });

        interaction.reply("📨 Transcript sent to transcript channel.");

        fs.unlinkSync(filename);
    }
};
