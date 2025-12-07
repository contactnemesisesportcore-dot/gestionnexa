// moderation.js
// Module unique de modération — init(client)
// Gère : logs (dans channel unique), anti-spam, anti-raid, anti-bot join, anti-link, anti-token,
// anti-create-abuse (salons/rôles), protection serveur, blacklist persistante.

const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const CONFIG = require('../config.json') || (fs.existsSync('./config.json') ? require('./config.json') : {});
const BLACKLIST_PATH = path.join(process.cwd(), 'blacklists.json');

// If config is at root, adjust
const cfg = (fs.existsSync('./config.json')) ? require('./config.json') : CONFIG;

function readBlacklist() {
  try {
    if (!fs.existsSync(BLACKLIST_PATH)) {
      fs.writeFileSync(BLACKLIST_PATH, JSON.stringify({ users: [] }, null, 2));
      return { users: [] };
    }
    return JSON.parse(fs.readFileSync(BLACKLIST_PATH, 'utf8'));
  } catch (e) {
    console.error('Erreur lecture blacklist:', e);
    return { users: [] };
  }
}
function writeBlacklist(obj) {
  try { fs.writeFileSync(BLACKLIST_PATH, JSON.stringify(obj, null, 2)); } catch(e){ console.error('Erreur save blacklist', e); }
}

// single logs channel id (you asked to unify logs)
const LOG_CHANNEL_ID = (cfg && cfg.logChannels && cfg.logChannels.general) || '1447333693797568512' || (cfg.logChannels ? cfg.logChannels.spam : null);

async function sendLog(client, title, fields = [], color = 0x8A2BE2) {
  try {
    if (!LOG_CHANNEL_ID) return console.warn('log channel not configured.');
    const ch = await client.channels.fetch(LOG_CHANNEL_ID).catch(()=>null);
    if (!ch) return console.warn('Salon logs introuvable:', LOG_CHANNEL_ID);
    const embed = new EmbedBuilder().setColor(color).setTitle(title).setTimestamp();
    fields.forEach(f => embed.addFields([{ name: f.name || 'Info', value: String(f.value || '—').slice(0,1024), inline: !!f.inline }]));
    await ch.send({ embeds: [embed] }).catch(()=>{});
  } catch (err) {
    console.error('sendLog error:', err);
  }
}

// Runtime maps
const spamMap = new Map(); // guildId -> Map(userId -> [timestamps])
const joinMap = new Map(); // guildId -> [timestamps]
const createMap = new Map(); // guildId -> Map(userId -> [timestamps])
const serverSnapshot = new Map(); // guildId -> {name, icon, banner}

module.exports = {
  init(client) {
    // ensure config defaults
    const thresholds = (cfg && cfg.thresholds) || { spam: { count:5, intervalMs:5000, timeoutMs:600000 }, raid:{count:10, intervalMs:10000}, createAbuse:{count:10, intervalMs:3600000} };
    const staffRoles = (cfg && cfg.staffRoleUnion) || [];

    // ---------- logs helper ----------
    client.modlog = async (title, fields, color) => sendLog(client, title, fields, color);

    // ---------- anti-spam ----------
    client.on('messageCreate', async (message) => {
      try {
        if (!message.guild || message.author.bot) return;
        const isStaff = message.member && message.member.roles.cache.some(r => staffRoles.includes(r.id));
        if (isStaff) return;

        const gid = message.guild.id;
        const userId = message.author.id;
        const now = Date.now();
        const guildMap = spamMap.get(gid) || new Map();
        const arr = guildMap.get(userId) || [];
        arr.push(now);
        const window = arr.filter(t => now - t <= thresholds.spam.intervalMs);
        guildMap.set(userId, window);
        spamMap.set(gid, guildMap);

        if (window.length >= thresholds.spam.count) {
          // delete recent messages by this author in channel (best-effort)
          try {
            const fetched = await message.channel.messages.fetch({ limit: 50 }).catch(()=>null);
            if (fetched) {
              const toDelete = fetched.filter(m => m.author.id === userId);
              for (const m of toDelete.values()) {
                try { await m.delete().catch(()=>{}); } catch(e){}
              }
            } else {
              try { await message.delete().catch(()=>{}); } catch(e){}
            }
          } catch(e){}

          // log
          await client.modlog('Anti-spam détecté', [
            { name: 'Auteur', value: `${message.author.tag} (${userId})` },
            { name: 'Salon', value: `${message.channel.name} (${message.channel.id})` },
            { name: 'Détail', value: `${window.length} messages en ${thresholds.spam.intervalMs/1000}s` }
          ]);

          // strikes progression
          const key = `spam:${gid}:${userId}`;
          const data = client.runtime[key] || { strikes: 0, last: 0 };
          if (Date.now() - data.last < (thresholds.spam.intervalMs * 6)) data.strikes = data.strikes + 1;
          else data.strikes = 1;
          data.last = Date.now();
          client.runtime[key] = data;

          if (data.strikes >= 2) {
            // timeout (if possible)
            if (message.member && message.member.moderatable) {
              const timeoutMs = thresholds.spam.timeoutMs;
              if (process.env.AUTO_ENFORCE === 'true') {
                try {
                  await message.member.timeout(timeoutMs, 'Spam répété (automatique)').catch(()=>{});
                  await client.modlog('Sanction appliquée (spam)', [
                    { name: 'Action', value: `Timeout ${timeoutMs/60000} minutes` },
                    { name: 'Auteur', value: `${message.author.tag} (${userId})` }
                  ]);
                } catch(e){ console.warn('Impossible timeout', e); }
              } else {
                await client.modlog('Sanction recommandée (spam)', [
                  { name: 'Proposition', value: `Timeout ${timeoutMs/60000} minutes (AUTO_ENFORCE=false)` }
                ]);
              }
            }
          } else {
            await client.modlog('Warn (anti-spam)', [
              { name: 'Auteur', value: `${message.author.tag} (${userId})` },
              { name: 'Action', value: 'Suppression des messages & avertissement (log)' }
            ]);
          }
        }
      } catch (err) {
        console.error('anti-spam error:', err);
      }
    });

    // ---------- anti-link & anti-nsfw (simple) ----------
    const urlRegex = /https?:\/\/[^\s]+/i;
    const nsfwWords = ['nsfw','porn','xxx','porno','sex','nude'];
    client.on('messageCreate', async (message) => {
      try {
        if (!message.guild || message.author.bot) return;
        const isStaff = message.member && message.member.roles.cache.some(r => staffRoles.includes(r.id));
        if (isStaff) return;
        const content = message.content || '';

        // token detection handled by other handler? we'll also check here
        const tokenPattern = /[MN][A-Za-z0-9_-]{23}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27}/;
        if (tokenPattern.test(content)) {
          await message.delete().catch(()=>{});
          await client.modlog('Anti-token détecté', [
            { name: 'Auteur', value: `${message.author.tag} (${message.author.id})` },
            { name: 'Salon', value: `${message.channel.name} (${message.channel.id})` }
          ], 0xFF0000);
          try { await message.author.send("Ton message contenait une chaîne sensible (token) et a été supprimé pour ta sécurité.").catch(()=>{}); } catch(e){}
          return;
        }

        if (urlRegex.test(content)) {
          const isInvite = /discord(?:app)?\.com\/invite|discord\.gg\//i.test(content);
          if (!isInvite) {
            await message.delete().catch(()=>{});
            await client.modlog('Anti-link', [
              { name: 'Auteur', value: `${message.author.tag} (${message.author.id})` },
              { name: 'Contenu', value: content.slice(0,1024) }
            ]);
            return;
          }
        }

        const lc = content.toLowerCase();
        if (nsfwWords.some(w => lc.includes(w))) {
          if (!message.channel.nsfw) {
            await message.delete().catch(()=>{});
            await client.modlog('Anti-NSFW', [
              { name: 'Auteur', value: `${message.author.tag} (${message.author.id})` },
              { name: 'Salon', value: `${message.channel.name} (${message.channel.id})` }
            ]);
            return;
          }
        }
      } catch (err) {
        console.error('anti-link/nsfw error:', err);
      }
    });

    // ---------- anti-bot join ----------
    client.on('guildMemberAdd', async (member) => {
      try {
        if (!member.user.bot) return;
        const allowed = (cfg.allowedBotIds) || [];
        if (allowed.includes(member.id)) return;
        await client.modlog('Bot détecté (join)', [
          { name: 'Bot', value: `${member.user.tag} (${member.id})` },
          { name: 'Action', value: process.env.AUTO_ENFORCE === 'true' ? 'Suppression automatique' : 'Alerte (AUTO_ENFORCE=false)' }
        ], 0xFFAA00);
        if (process.env.AUTO_ENFORCE === 'true') {
          try { await member.kick('Bot non autorisé (anti-bot)').catch(()=>{}); } catch(e){}
        }
      } catch (err) { console.error('anti-bot error:', err); }
    });

    // ---------- anti-raid (joins) ----------
    client.on('guildMemberAdd', async (member) => {
      try {
        const gid = member.guild.id;
        const arr = joinMap.get(gid) || [];
        arr.push(Date.now());
        const interval = thresholds.raid.intervalMs;
        const window = arr.filter(t => Date.now() - t <= interval);
        joinMap.set(gid, window);

        if (window.length >= thresholds.raid.count) {
          await client.modlog('Anti-raid déclenché', [
            { name: 'Guild', value: `${member.guild.name} (${gid})` },
            { name: 'Joins', value: `${window.length} en ${interval/1000}s` }
          ], 0xFF0000);

          // Lockdown: deny view/send to @everyone for text channels (best-effort)
          for (const ch of member.guild.channels.cache.values()) {
            try {
              if (ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildForum) {
                await ch.permissionOverwrites.edit(member.guild.id, { ViewChannel: false, SendMessages: false }).catch(()=>{});
              }
            } catch(e){}
          }

          if (process.env.AUTO_ENFORCE === 'true') {
            await client.modlog('Action automatique (raid)', [{ name: 'Info', value: 'Lockdown appliqué (AUTO_ENFORCE=true)' }], 0xFF0000);
          } else {
            await client.modlog('Action recommandée (raid)', [{ name: 'Info', value: 'Vérifier les nouveaux comptes via audit logs / ban si nécessaire' }], 0xFFAA00);
          }
        }
      } catch (err) { console.error('anti-raid error:', err); }
    });

    // ---------- anti-create abuse (channelCreate / roleCreate) ----------
    client.on('channelCreate', async (channel) => {
      try {
        if (!channel.guild) return;
        const logsAudit = await channel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_CREATE' }).catch(()=>null);
        const entry = logsAudit && logsAudit.entries.first();
        if (!entry) return;
        const userId = entry.executor.id;
        if (staffRoles.includes(userId)) return;

        const gmap = createMap.get(channel.guild.id) || new Map();
        const arr = gmap.get(userId) || [];
        arr.push(Date.now());
        const window = arr.filter(t => Date.now() - t <= thresholds.createAbuse.intervalMs);
        gmap.set(userId, window);
        createMap.set(channel.guild.id, gmap);

        if (window.length >= thresholds.createAbuse.count) {
          const bl = readBlacklist();
          if (!bl.users.includes(userId)) {
            bl.users.push(userId);
            writeBlacklist(bl);
            await client.modlog('Blacklist automatique (création salons)', [
              { name: 'Auteur', value: `${entry.executor.tag || entry.executor.username} (${userId})` },
              { name: 'Raison', value: `Création de ${window.length} salons en ${thresholds.createAbuse.intervalMs/3600000}h` }
            ], 0xFF0000);
            if (process.env.AUTO_ENFORCE === 'true') {
              try { await channel.guild.bans.create(userId, { reason: 'Création abusive de salons (blacklist)' }).catch(()=>{}); } catch(e){}
            }
          }
        }
      } catch (err) { console.error('channelCreate anti-create:', err); }
    });

    client.on('roleCreate', async (role) => {
      try {
        const logsAudit = await role.guild.fetchAuditLogs({ limit: 1, type: 'ROLE_CREATE' }).catch(()=>null);
        const entry = logsAudit && logsAudit.entries.first();
        if (!entry) return;
        const userId = entry.executor.id;
        if (staffRoles.includes(userId)) return;

        const gmap = createMap.get(role.guild.id) || new Map();
        const arr = gmap.get(userId) || [];
        arr.push(Date.now());
        const window = arr.filter(t => Date.now() - t <= thresholds.createAbuse.intervalMs);
        gmap.set(userId, window);
        createMap.set(role.guild.id, gmap);

        if (window.length >= thresholds.createAbuse.count) {
          const bl = readBlacklist();
          if (!bl.users.includes(userId)) {
            bl.users.push(userId);
            writeBlacklist(bl);
            await client.modlog('Blacklist automatique (création rôles)', [
              { name: 'Auteur', value: `${entry.executor.tag || entry.executor.username} (${userId})` },
              { name: 'Raison', value: `Création de ${window.length} rôles en ${thresholds.createAbuse.intervalMs/3600000}h` }
            ], 0xFF0000);
            if (process.env.AUTO_ENFORCE === 'true') {
              try { await role.guild.bans.create(userId, { reason: 'Création abusive de rôles (blacklist)' }).catch(()=>{}); } catch(e){}
            }
          }
        }
      } catch (err) { console.error('roleCreate anti-create:', err); }
    });

    // ---------- protect server (guildUpdate) ----------
    client.once('ready', () => {
      // snapshot initial
      client.guilds.cache.forEach(g => {
        serverSnapshot.set(g.id, { name: g.name, icon: g.icon, ownerId: g.ownerId });
      });
    });

    client.on('guildUpdate', async (oldGuild, newGuild) => {
      try {
        const entry = (await newGuild.fetchAuditLogs({ limit: 1, type: 'GUILD_UPDATE' }).catch(()=>null))?.entries?.first();
        if (!entry) return;
        const actor = entry.executor;
        const prev = serverSnapshot.get(newGuild.id) || {};
        await client.modlog('Protection paramètres serveur', [
          { name: 'Qui', value: `${actor.tag} (${actor.id})` },
          { name: 'Avant - Nom', value: prev.name || oldGuild.name },
          { name: 'Après - Nom', value: newGuild.name }
        ], 0xFFAA00);

        // revert name/icon if modified and actor not owner
        if (prev.name && prev.name !== newGuild.name && actor.id !== newGuild.ownerId) {
          try { await newGuild.setName(prev.name, 'Réversion automatique (protectServer)').catch(()=>{}); } catch(e){}
        }
        if (prev.icon && prev.icon !== newGuild.icon && actor.id !== newGuild.ownerId) {
          try { await newGuild.setIcon(prev.icon, 'Réversion automatique (protectServer)').catch(()=>{}); } catch(e){}
        }
      } catch (err) { console.error('protectServer error:', err); }
    });

    // ---------- command to check blacklist (optional) ----------
    // Not implemented commands here to keep file focused on event-based protections.

    // Finished init log
    console.log('Module moderation initialisé');
  }
};
