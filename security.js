// security.js — NexaBot Anti-Selfbot Ultra

const { EmbedBuilder } = require("discord.js");

module.exports.init = (client) => {

  const {
    securityLogs,
    blockedPrefixes,
    trustedRoles,
    trustedUsers,
    limits,
    suspicionPoints,
    suspicionThreshold,
    securityTimeoutMinutes
  } = client.config;

  const userStats = new Map();

  const isTrusted = (member) => {
    if (!member) return false;
    if (trustedUsers.includes(member.id)) return true;
    return member.roles.cache.some(r => trustedRoles.includes(r.id));
  };

  const logSecurity = async (guild, data) => {
    const ch = guild.channels.cache.get(securityLogs);
    if (!ch) return;

    const embed = new EmbedBuilder()
      .setTitle("🛡️ Anti-Selfbot — Détection")
      .setColor(0xFF0000)
      .addFields(
        { name: "Utilisateur", value: `${data.user.tag} (${data.user.id})` },
        { name: "Raison", value: data.reason },
        { name: "Score", value: `${data.score}` },
        { name: "Action", value: data.action }
      )
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => {});
  };

  client.on("messageCreate", async message => {
    if (!message.guild || message.author.bot) return;
    if (isTrusted(message.member)) return;

    const now = Date.now();
    const content = message.content || "";

    if (!userStats.has(message.author.id)) {
      userStats.set(message.author.id, {
        score: 0,
        messages: []
      });
    }

    const stats = userStats.get(message.author.id);
    stats.messages.push(now);
    stats.messages = stats.messages.filter(t => now - t < limits.seconds * 1000);

    // ===== 1️⃣ Préfixes suspects =====
    if (blockedPrefixes.some(p => content.startsWith(p))) {
      stats.score += suspicionPoints.prefix;
    }

    // ===== 2️⃣ Flood vitesse inhumaine =====
    if (stats.messages.length >= limits.messages) {
      stats.score += suspicionPoints.flood;
    }

    // ===== 3️⃣ Mentions abusives =====
    if (message.mentions.users.size >= limits.mentions) {
      stats.score += suspicionPoints.mentions;
    }

    // ===== 4️⃣ Emojis spam =====
    const emojiCount = (content.match(/<a?:\w+:\d+>/g) || []).length;
    if (emojiCount >= limits.emojis) {
      stats.score += suspicionPoints.emojis;
    }

    // ===== 5️⃣ ASCII / lignes =====
    if (content.length >= limits.asciiLength || content.split("\n").length >= limits.lines) {
      stats.score += suspicionPoints.ascii;
    }

    // ===== SANCTION =====
    if (stats.score >= suspicionThreshold) {
      await message.delete().catch(() => {});
      await message.member.timeout(
        securityTimeoutMinutes * 60 * 1000,
        "Anti-Selfbot : comportement automatisé"
      ).catch(() => {});

      await logSecurity(message.guild, {
        user: message.author,
        reason: "Comportement assimilé à un self-bot",
        score: stats.score,
        action: `Timeout ${securityTimeoutMinutes} min`
      });

      userStats.delete(message.author.id);
    }
  });

  console.log("🛡️ Module SECURITY chargé (anti-selfbot actif)");
};
