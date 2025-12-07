const client = require('./index.js');
const { EmbedBuilder } = require('discord.js');

const WELCOME_CHANNEL = '1443299713012207748';
const WELCOME_ROLE = '1443299666765807647';
const WELCOME_IMAGE = 'https://media.discordapp.net/attachments/1431355214052589659/1442619898114211931/Capture_decran_2025-11-24_215331.png';

client.on('guildMemberAdd', async member => {
    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL);
    if (!channel) return;

    const role = member.guild.roles.cache.get(WELCOME_ROLE);
    if (role) await member.roles.add(role);

    const embed = new EmbedBuilder()
        .setColor('#8e44ad')
        .setTitle(`Bienvenue ${member.user.username} !`)
        .setDescription(`Salut ${member}, bienvenue sur le serveur **Nexa Esport** !\nNous sommes maintenant **${member.guild.memberCount} membres**.`)
        .addFields(
            { name: 'Rejoins-nous ici', value: '<#1443299714744451233>' },
            { name: 'Créer un ticket', value: '<#1443299733392199871>' }
        )
        .setThumbnail(WELCOME_IMAGE)
        .setFooter({ text: 'Passez une excellente journée sur le serveur !' });

    channel.send({ content: '@everyone', embeds: [embed] });
});
