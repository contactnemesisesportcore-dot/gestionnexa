// bienvenue.js
// Embed de bienvenue propre, pas de mention @everyone, ajoute rôle si possible.

const { EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'config.json');
const cfg = fs.existsSync(configPath) ? require(configPath) : {};

module.exports = {
  init(client) {
    client.on('guildMemberAdd', async (member) => {
      try {
        const welcomeConf = (cfg.welcome) || {};
        const channelId = welcomeConf.channelId;
        const roleId = welcomeConf.roleToAdd;
        const mentionOwnerId = welcomeConf.mentionOwnerId || welcomeConf.ownerId || '1398784567946645545';
        const image = welcomeConf.image || cfg.image || null;

        // add role if possible
        try {
          if (roleId && member.guild.roles.cache.has(roleId)) {
            await member.roles.add(roleId).catch(()=>{});
          }
        } catch (e) {
          console.warn('Impossible d\'ajouter le rôle d\'accueil :', e);
        }

        // refresh members count
        try { await member.guild.members.fetch().catch(()=>{}); } catch(e){}

        const count = member.guild.memberCount;

        // fetch target channel
        const ch = await member.guild.channels.fetch(channelId).catch(()=>null);
        if (!ch || !ch.send) {
          // fallback: log to console
          console.warn('Salon de bienvenue introuvable:', channelId);
          return;
        }

        // build embed (violet)
        const embed = new EmbedBuilder()
          .setColor('#8A2BE2')
          .setTitle(`Bienvenue ${member.user.username} 👋`)
          .setThumbnail(image || member.user.displayAvatarURL({ dynamic: true }))
          .setDescription(`__${member}__\n${member} sur le serveur **${member.guild.name}** ! Grâce à toi, nous sommes **${count}** membres sur le serveur.\n\nVeuillez lire le règlement : <#1443299714744451233>\n\nPour ouvrir un ticket : <#1443299733392199871>\n\nCordialement <@${mentionOwnerId}>\nPassez une excellente journée sur le serveur !`)
          .setImage(image || null)
          .setTimestamp()
          .setFooter({ text: 'Nexa Esport' });

        await ch.send({ embeds: [embed] }).catch(async (err) => {
          console.warn('Erreur envoi embed bienvenue:', err);
        });

        // Optionnel : update status immediately (index.js gère rotation normalement)
        try {
          const guild = member.guild;
          const countNow = guild.memberCount;
          await client.user.setActivity(`Surveille ${countNow} membres`, { type: ActivityType.Streaming, url: cfg.twitch || 'https://www.twitch.tv/nexacorp' }).catch(()=>{});
        } catch(e){}
      } catch (err) {
        console.error('bienvenue.js error:', err);
      }
    });
  }
};
