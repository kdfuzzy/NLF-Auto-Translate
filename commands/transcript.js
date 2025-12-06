const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("transcript")
        .setDescription("Generate a transcript for this ticket"),

    async execute(interaction, client, config) {
        const member = interaction.member;
        const channel = interaction.channel;

        if (!member.roles.cache.some(r => config.staffRoles.includes(r.id)))
            return interaction.reply({ content: "❌ Staff only.", ephemeral: true });

        if (!config.transcriptChannel)
            return interaction.reply({ content: "❌ Transcript channel not set.", ephemeral: true });

        const messages = await channel.messages.fetch({ limit: 100 });
        const sorted = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        let txt = "";
        sorted.forEach(m => {
            txt += `${m.author.tag}: ${m.content}\n`;
        });

        const file = `transcript-${channel.id}.txt`;
        fs.writeFileSync(file, txt);

        const tc = interaction.guild.channels.cache.get(config.transcriptChannel);

        await tc.send({ content: `📄 Transcript for ${channel.name}`, files: [file] });
        interaction.reply("📨 Transcript sent.");

        fs.unlinkSync(file);
    }
};
