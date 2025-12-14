// =====================================================
// SECURITY.SELFBOT.JS — PROTECTION EXTRÊME
// ZÉRO COMMANDE • ZÉRO PRÉFIXE • SANCTION IMMÉDIATE
// =====================================================

module.exports.init = (client) => {

  const cfg = client.config;
  const activity = new Map();

  // ===============================
  // UTILS
  // ===============================
  const isTrusted = (member) => {
    if (!member) return false;
    if (cfg.trustedUsers.includes(member.id)) return true;
    return member.roles.cache.some(r => cfg.trustedRoles.includes(r.id));
  };

  const log = async (guild, text) => {
    const ch = guild.channels.cache.get(cfg.securityLogs);
    if (ch) ch.send(text).catch(() => {});
  };

  const punish = async (msg, reason) => {
    await msg.delete().catch(() => {});
    if (msg.member?.moderatable) {
      await msg.member.timeout(
        cfg.securityTimeoutMinutes * 60 * 1000,
        reason
      ).catch(() => {});
    }
  };

  // ===============================
  // MESSAGE MONITOR
  // ===============================
  client.on("messageCreate", async (msg) => {
    try {
      if (!msg.guild) return;
      if (msg.author.bot) return;
      if (msg.guild.id !== cfg.guildID) return;
      if (isTrusted(msg.member)) return;

      const uid = msg.author.id;
      const now = Date.now();
      const content = msg.content || "";

      // ===============================
      // TRACKING TEMPOREL (ANTI MACRO)
      // ===============================
      if (!activity.has(uid)) activity.set(uid, []);
      const times = activity.get(uid).filter(t => now - t < cfg.limits.seconds * 1000);
      times.push(now);
      activity.set(uid, times);

      // ===============================
      // 1️⃣ PREFIX = SELFBOT
      // ===============================
      if (cfg.blockedPrefixes.some(p => content.startsWith(p))) {
        await punish(msg, "Selfbot (prefix interdit)");
        await log(msg.guild,
          `🚨 **SELFBOT / PREFIX**
👤 ${msg.author.tag} (${uid})
📝 ${content.slice(0, 300)}`
        );
        return;
      }

      // ===============================
      // 2️⃣ VITESSE INHUMAINE
      // ===============================
      if (times.length >= cfg.limits.messages) {
        await punish(msg, "Flood inhumain");
        await log(msg.guild,
          `🚨 **SELFBOT / FLOOD**
👤 ${msg.author.tag} (${uid})`
        );
        return;
      }

      // ===============================
      // 3️⃣ MENTIONS MASSIVES
      // ===============================
      if (msg.mentions.users.size >= cfg.limits.mentions) {
        await punish(msg, "Mentions abusives");
        await log(msg.guild,
          `🚨 **SELFBOT / MENTIONS**
👤 ${msg.author.tag} (${uid})`
        );
        return;
      }

      // ===============================
      // 4️⃣ EMOJIS / MACRO
      // ===============================
      const emojis = content.match(/<a?:\w+:\d+>|[\u{1F300}-\u{1FAFF}]/gu) || [];
      if (emojis.length >= cfg.limits.emojis) {
        await punish(msg, "Emoji macro");
        await log(msg.guild,
          `🚨 **SELFBOT / EMOJIS**
👤 ${msg.author.tag} (${uid})`
        );
        return;
      }

      // ===============================
      // 5️⃣ ASCII / PAYLOAD
      // ===============================
      if (
        content.length >= cfg.limits.asciiLength ||
        content.split("\n").length >= cfg.limits.lines
      ) {
        await punish(msg, "ASCII / Payload");
        await log(msg.guild,
          `🚨 **SELFBOT / ASCII**
👤 ${msg.author.tag} (${uid})`
        );
        return;
      }

    } catch (e) {
      console.error("SECURITY.SELFBOT ERROR:", e);
    }
  });
};
