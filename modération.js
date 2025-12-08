// moderation.js
// Module unique de modération — init(client)
// Anti-spam, anti-raid, anti-bot join, anti-link, anti-token,
// anti-create-abuse (channels/roles), protection serveur, blacklist persistante,
// logs en français. Spam alerts -> salon 1443327024323100813

const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ChannelType } = require('discord.js');

const CONFIG_PATH = path.join(process.cwd(), 'config.json');
const cfg = fs.existsSync(CONFIG_PATH) ? require(CONFIG_PATH) : {};
const BLACKLIST_PATH = path.join(process.cwd(), 'blacklists.json');

// ---- blacklist helpers
function loadBlacklist() {
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
function saveBlacklist(obj) {
  try { fs.writeFileSync(BLACKLIST_PATH, JSON.stringify(obj, null, 2)); } catch(e){ console.error('Erreur save blacklist', e); }
}

// ---- log channels
const SPAM_LOG_CHANNEL = '1443327024323100813'; // salon SPAM fourni par toi
const GENERAL_LOG_CHANNEL = (cfg.logChannels && (cfg.logChannels.general || cfg.logChannels.spam)) || SPAM_LOG_CHANNEL;

// ---- send log helper
async function sendLog(client, channelId, title, fields = [], color = 0x8A2BE2) {
  try {
    if (!channelId) return;
    const ch = await client.channels.fetch(channelId).catch(()=>null);
    if (!ch || !ch.send) return;
    const embed = new EmbedBuilder().setColor(color).setTitle(title).setTimestamp();
    for (const f of fields) embed.addFields([{ name: f.name || 'Info', value: String(f.value || '—').slice(0,1024), inline: !!f.inline }]);
    await ch.send({ embeds: [embed] }).catch(()=>{});
  } catch (err) {
    console.error('sendLog error:', err);
  }
}

// ---- runtime maps
const spamMap = new Map();    // guildId -> Map(userId -> [timestamps])
const joinMap = new Map();    // guildId -> [timestamps]
const createMap = new Map();  // guildId -> Map(userId -> [timestamps])
const serverSnapshot = new Map();

module.exports = {
  init(client) {
    const thresholds = (cfg.thresholds) || {
      spam: { count: 5, intervalMs: 5000, timeoutMs: 10 * 60 * 1000 },
      raid: { count: 10, intervalMs: 10000 },
      createAbuse: { count: 10, intervalMs: 60 * 60 * 1000 }
    };
    const staffRoles = (cfg.staffRoleUnion || []).map(String);

    const isStaff = (member) => {
      try {
        if (!member || !member.roles) return false;
        return member.roles.cache.some(r => staffRoles.includes(String(r.id)));
      } catch { return false; }
    };

    // expose logging util
    client.modlog = async (title, fields = [], color = 0x8A2BE2) => sendLog(client, GENERAL_LOG_CHANNEL, title, fields, color);

    // ---------- ANTI-SPAM ----------
    client.on('messageCreate', async (message) => {
      try {
        if (!message.guild || message.author.bot) return;
        if (message.member && isStaff(message.member)) return;

        const gid = message.guild.id;
        const uid = message.author.id;
        const now = Date.now();

        const guildMap = spamMap.get(gid) || new Map();
        const arr = guildMap.get(uid) || [];
        arr.push(now);
        const window = arr.filter(t => now - t <= thresholds.spam.intervalMs);
        guildMap.set(uid, window);
        spamMap.set(gid, guildMap);

        if (window.length >= thresholds.spam.count) {
          // delete recent messages from this user in the channel (best-effort)
          try {
            const fetched = await message.channel.messages.fetch({ limit: 50 }).catch(()=>null);
            if (fetched) {
              const toDelete = fetched.filter(m => m.author.id === uid);
              for (const m of toDelete.values()) {
                try { await m.delete().catch(()=>{}); } catch(e){}
              }
            } else {
              try { await message.delete().catch(()=>{}); } catch(e){}
            }
          } catch (e) { /* ignore */ }

          // log to spam channel
          await sendLog(client, SPAM_LOG_CHANNEL, '🔇 Anti-spam : messages supprimés', [
            { name: 'Auteur', value: `${message.author.tag} (${uid})` },
            { name: 'Salon', value: `${message.channel.name} (${message.channel.id})` },
            { name: 'Détail', value: `${window.length} messages en ${thresholds.spam.intervalMs/1000}s` }
          ], 0xFF8A00);

          // channel warning (transient)
          try {
            const warnMsg = await message.channel.send({ content: `⚠️ ${message.author}, attention au spam — vos messages récents ont été supprimés.` }).catch(()=>null);
            if (warnMsg) setTimeout(()=>warnMsg.delete().catch(()=>{}), 10000);
          } catch(e){}

          // strikes progression
          const key = `spam:${gid}:${uid}`;
          const data = client.runtime[key] || { strikes: 0, last: 0 };
          if (Date.now() - data.last < (thresholds.spam.intervalMs * 6)) data.strikes++;
          else data.strikes = 1;
          data.last = Date.now();
          client.runtime[key] = data;

          // if repeated -> timeout
          if (data.strikes >= 2) {
            if (message.member && message.member.moderatable) {
              const timeoutMs = thresholds.spam.timeoutMs;
              if (process.env.AUTO_ENFORCE === 'true') {
                try {
                  await message.member.timeout(timeoutMs, 'Spam répété (automatique)').catch(()=>{});
                  await sendLog(client, SPAM_LOG_CHANNEL, '🔒 Anti-spam : timeout appliqué', [
                    { name: 'Auteur', value: `${message.author.tag} (${uid})` },
                    { name: 'Durée', value: `${timeoutMs/60000} minutes` }
                  ], 0xFF0000);
                } catch (e) {
                  console.warn('Impossible timeout:', e);
                }
              } else {
                await sendLog(client, SPAM_LOG_CHANNEL, 'ℹ️ Anti-spam : sanction recommandée', [
                  { name: 'Auteur', value: `${message.author.tag} (${uid})` },
                  { name: 'Proposition', value: `Timeout ${thresholds.spam.timeoutMs/60000} minutes (AUTO_ENFORCE=false)` }
                ], 0xFFAA00);
              }
            }
          }
        }
      } catch (err) {
        console.error('anti-spam error:', err);
      }
    });

    // ---------- TOKEN / LINK / NSFW ----------
    const urlRegex = /https?:\/\/[^\s]+/i;
    const tokenPattern = /[MN][A-Za-z0-9_-]{23}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27}/i;
    const nsfwWords = ['nsfw','porn','xxx','porno','sex','nude'];

    client.on('messageCreate', async (message) => {
      try {
        if (!message.guild || message.author.bot) return;
        if (message.member && isStaff(message.member)) return;
        const content = message.content || '';

        // token
        if (tokenPattern.test(content)) {
          await message.delete().catch(()=>{});
          await sendLog(client, SPAM_LOG_CHANNEL, '🔐 Anti-token détecté', [
            { name: 'Auteur', value: `${message.author.tag} (${message.author.id})` },
            { name: 'Salon', value: `${message.channel.name} (${message.channel.id})` }
          ], 0xFF0000);
          try { await message.author.send("⚠️ Ton message contenait une chaîne sensible (token) et a été supprimé pour ta sécurité.").catch(()=>{}); } catch(e){}
          return;
        }

        // link (autorise invites Discord, bloque le reste)
        if (urlRegex.test(content)) {
          const isInvite = /discord(?:app)?\.com\/invite|discord\.gg\//i.test(content);
          if (!isInvite) {
            await message.delete().catch(()=>{});
            await sendLog(client, SPAM_LOG_CHANNEL, '🔗 Anti-link', [
              { name: 'Auteur', value: `${message.author.tag} (${message.author.id})` },
              { name: 'Contenu', value: content.slice(0,1024) }
            ], 0xCC3300);
            return;
          }
        }

        // nsfw keywords
        const lc = content.toLowerCase();
        if (nsfwWords.some(w => lc.includes(w))) {
          if (!message.channel.nsfw) {
            await message.delete().catch(()=>{});
            await sendLog(client, SPAM_LOG_CHANNEL, '🚫 Anti-NSFW', [
              { name: 'Auteur', value: `${message.author.tag} (${message.author.id})` },
              { name: 'Salon', value: `${message.channel.name} (${message.channel.id})` }
            ], 0xCC00CC);
            return;
          }
        }
      } catch (err) {
        console.error('anti-link/token/nsfw error:', err);
      }
    });

    // ---------- ANTI-BOT JOIN ----------
    client.on('guildMemberAdd', async (member) => {
      try {
        if (!member.user.bot) return;
        const allowed = (cfg.allowedBotIds || []).map(String);
        if (allowed.includes(String(member.id))) return;

        await sendLog(client, SPAM_LOG_CHANNEL, '🤖 Bot détecté (join)', [
          { name: 'Bot', value: `${member.user.tag} (${member.id})` },
          { name: 'Action', value: process.env.AUTO_ENFORCE === 'true' ? 'Suppression automatique' : 'Alerte (AUTO_ENFORCE=false)' }
        ], 0xFFAA00);

        if (process.env.AUTO_ENFORCE === 'true') {
          try { await member.kick('Bot non autorisé (anti-bot)').catch(()=>{}); } catch(e){}
        }
      } catch (err) { console.error('anti-bot error', err); }
    });

    // ---------- ANTI-RAID ----------
    client.on('guildMemberAdd', async (member) => {
      try {
        const gid = member.guild.id;
        const arr = joinMap.get(gid) || [];
        arr.push(Date.now());
        const interval = thresholds.raid.intervalMs;
        const window = arr.filter(t => Date.now() - t <= interval);
        joinMap.set(gid, window);

        if (window.length >= thresholds.raid.count) {
          await sendLog(client, SPAM_LOG_CHANNEL, '🚨 Anti-raid déclenché', [
            { name: 'Guild', value: `${member.guild.name} (${gid})` },
            { name: 'Joins', value: `${window.length} en ${interval/1000}s` }
          ], 0xFF0000);

          // Lockdown (best-effort)
          for (const ch of member.guild.channels.cache.values()) {
            try {
              if (ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildForum) {
                await ch.permissionOverwrites.edit(member.guild.id, { ViewChannel: false, SendMessages: false }).catch(()=>{});
              }
            } catch(e){}
          }

          if (process.env.AUTO_ENFORCE === 'true') {
            await sendLog(client, SPAM_LOG_CHANNEL, '🔒 Action automatique (raid)', [{ name: 'Info', value: 'Lockdown appliqué (AUTO_ENFORCE=true)' }], 0xFF0000);
          } else {
            await sendLog(client, SPAM_LOG_CHANNEL, 'ℹ️ Action recommandée (raid)', [{ name: 'Info', value: 'Vérifier audit logs et bannir si nécessaire' }], 0xFFAA00);
          }
        }
      } catch (err) { console.error('anti-raid error', err); }
    });

    // ---------- ANTI-CREATE ABUSE (channels / roles) ----------
    client.on('channelCreate', async (channel) => {
      try {
        if (!channel.guild) return;
        const audit = await channel.guild.fetchAuditLogs({ limit: 1, type: 'CHANNEL_CREATE' }).catch(()=>null);
        const entry = audit && audit.entries.first();
        if (!entry) return;
        const userId = String(entry.executor.id);
        if (staffRoles.includes(userId)) return;

        const gmap = createMap.get(channel.guild.id) || new Map();
        const arr = gmap.get(userId) || [];
        arr.push(Date.now());
        const window = arr.filter(t => Date.now() - t <= thresholds.createAbuse.intervalMs);
        gmap.set(userId, window);
        createMap.set(channel.guild.id, gmap);

        if (window.length >= thresholds.createAbuse.count) {
          const bl = loadBlacklist();
          if (!bl.users.includes(userId)) {
            bl.users.push(userId);
            saveBlacklist(bl);
            await sendLog(client, SPAM_LOG_CHANNEL, '⛔ Blacklist automatique (création salons)', [
              { name: 'Auteur', value: `${entry.executor.tag || entry.executor.username} (${userId})` },
              { name: 'Raison', value: `Création de ${window.length} salons en ${thresholds.createAbuse.intervalMs/3600000}h` }
            ], 0xFF0000);
            if (process.env.AUTO_ENFORCE === 'true') {
              try { await channel.guild.members.ban(userId, { reason: 'Création abusive de salons (blacklist)' }).catch(()=>{}); } catch(e){}
            }
          }
        }
      } catch (err) { console.error('anti-create channel error', err); }
    });

    client.on('roleCreate', async (role) => {
      try {
        if (!role.guild) return;
        const audit = await role.guild.fetchAuditLogs({ limit: 1, type: 'ROLE_CREATE' }).catch(()=>null);
        const entry = audit && audit.entries.first();
        if (!entry) return;
        const userId = String(entry.executor.id);
        if (staffRoles.includes(userId)) return;

        const gmap = createMap.get(role.guild.id) || new Map();
        const arr = gmap.get(userId) || [];
        arr.push(Date.now());
        const window = arr.filter(t => Date.now() - t <= thresholds.createAbuse.intervalMs);
        gmap.set(userId, window);
        createMap.set(role.guild.id, gmap);

        if (window.length >= thresholds.createAbuse.count) {
          const bl = loadBlacklist();
          if (!bl.users.includes(userId)) {
            bl.users.push(userId);
            saveBlacklist(bl);
            await sendLog(client, SPAM_LOG_CHANNEL, '⛔ Blacklist automatique (création rôles)', [
              { name: 'Auteur', value: `${entry.executor.tag || entry.executor.username} (${userId})` },
              { name: 'Raison', value: `Création de ${window.length} rôles en ${thresholds.createAbuse.intervalMs/3600000}h` }
            ], 0xFF0000);
            if (process.env.AUTO_ENFORCE === 'true') {
              try { await role.guild.members.ban(userId, { reason: 'Création abusive de rôles (blacklist)' }).catch(()=>{}); } catch(e){}
            }
          }
        }
      } catch (err) { console.error('anti-create role error', err); }
    });

    // ---------- PROTECT SERVER (guildUpdate) ----------
    client.once('ready', () => {
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
        await sendLog(client, SPAM_LOG_CHANNEL, '🔐 Protection paramètres serveur', [
          { name: 'Qui', value: `${actor.tag} (${actor.id})` },
          { name: 'Avant - Nom', value: prev.name || oldGuild.name },
          { name: 'Après - Nom', value: newGuild.name }
        ], 0xFFAA00);

        if (prev.name && prev.name !== newGuild.name && actor.id !== newGuild.ownerId) {
          try { await newGuild.setName(prev.name, 'Réversion automatique (protectServer)').catch(()=>{}); } catch(e){}
        }
        if (prev.icon && prev.icon !== newGuild.icon && actor.id !== newGuild.ownerId) {
          try { await newGuild.setIcon(prev.icon, 'Réversion automatique (protectServer)').catch(()=>{}); } catch(e){}
        }
      } catch (err) { console.error('protectServer error', err); }
    });

    console.log('Module moderation initialisé');
  }
};
