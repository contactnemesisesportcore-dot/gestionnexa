// welcome.js
const { EmbedBuilder, ActivityType } = require('discord.js');
const CONFIG = require('./config.json');
const logs = require('./moderation/logsFallback'); // fallback logger included below (simple)

module.exports = {
  init(client) {
    client.on('guildMemberAdd', async (member) => {
      try {
        const conf = CONFIG.welcome || {};
        const channelId = conf.channelId;
        const roleId = conf.roleToAdd;
        const mentionOwnerId = conf.mentionOwnerId;
        const img = conf.image;

        // add role
        try {
          if (roleId && member.guild.roles.cache.has(roleId)) {
            await member.roles.add(roleId).catch(()=>{});
          }
        } catch (e) {
          console.warn('Impossible d\'ajouter le rôle d’accueil :', e);
        }

        // fetch members to update count
        try { await member.guild.members.fetch().catch(()=>{}); } catch(e){}

        const count = member.guild.memberCount;
        const ch = await member.guild.channels.fetch(channelId).catch(()=>null);
        if (!ch) {
          // log fallback
          await logs.send(client, 'logs', 'Bienvenue - salon introuvable', [
            { name: 'Guild', value: `${member.guild.name} (${member.guild.id})` },
            { name: 'Salon attendu', value: channelId || 'non spécifié' }
          ]);
          return;
        }

        const embed = new EmbedBuilder()
          .setColor('#8A2BE2')
          .setTitle(`Bienvenue ${member.user.username} 👋`)
          .setThumbnail(img || member.user.displayAvatarURL({ dynamic: true }))
          .setDescription(`__${member}__\n${member} sur le serveur **${member.guild.name}** ! Grâce à toi, nous sommes **${count}** membres sur le serveur.\n\nVous pouvez prendre connaissance du règlement : <#1443299714744451233>\n\nEt si tu souhaites nous rejoindre ou autre, crée un ticket : <#1443299733392199871>\n\nCordialement <@${mentionOwnerId || '1398784567946645545'}>\nPassez une excellente journée sur le serveur !`)
          .setImage(img || null)
          .setTimestamp()
          .setFooter({ text: 'Nexa Esport' });

        await ch.send({ embeds: [embed] }).catch(async (err) => {
          console.warn('Erreur envoi embed bienvenue:', err);
          await logs.send(client, 'logs', 'Erreur envoi bienvenue', [{ name: 'Erreur', value: String(err) }]);
        });

        // log
        await logs.send(client, 'logs', 'Nouveau membre', [
          { name: 'Membre', value: `${member.user.tag} (${member.id})` },
          { name: 'Rôle ajouté', value: roleId || 'aucun' },
          { name: 'Total membres', value: String(count) }
        ]);

        // immediate status refresh: set one of the statuses (optional)
        try {
          await client.user.setActivity(`Surveille ${count} membres`, { type: ActivityType.Streaming, url: CONFIG.twitchUrl || 'https://www.twitch.tv/nexacorp' });
        } catch(e){}
      } catch (err) {
        console.error('welcome.js error:', err);
      }
    });
  }
};
