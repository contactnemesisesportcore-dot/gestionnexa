const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {

        const channelId = "1443299713012207748"; // <-- Donne-le-moi
        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle(`👋 Bienvenue ${member.user.username} !`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setImage("https://media.discordapp.net/attachments/1431355214052589659/1442619898114211931/Capture_decran_2025-11-24_215331.png")
        .setDescription(
            `> Nous te souhaitons la bienvenue sur **${member.guild.name}** ! 🎉\n\n`
            + `> Tu es maintenant le **${member.guild.memberCount}ᵉ membre** du serveur.\n`
            + `> Prends connaissance du règlement et passe un bon moment parmi nous !`
        )
        .setFooter({ text: 'Système Automatique — Nemesis Security' })
        .setTimestamp();

        channel.send({ embeds: [embed] });
    }
};
