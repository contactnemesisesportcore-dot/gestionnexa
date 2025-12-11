module.exports.init = (client) => {

  // =========================
  // ANTI-SPAM
  // =========================
  const spamMap = new Map();

  client.on("messageCreate", async msg => {
    if (!msg.guild || msg.author.bot) return;

    const userId = msg.author.id;
    const now = Date.now();

    if (!spamMap.has(userId)) spamMap.set(userId, []);

    const timestamps = spamMap.get(userId);
    timestamps.push(now);

    const last = timestamps.filter(t => now - t < 10000);
    spamMap.set(userId, last);

    if (last.length >= client.config.spamCount) {
      await msg.delete().catch(() => {});

      msg.channel.send(`${msg.author}, ⚠ veuillez éviter le spam.`)
        .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));

      const logs = client.channels.cache.get(client.config.logSpam);
      if (logs) logs.send(
        `🟧 **SPAM détecté**\n` +
        `👤 Utilisateur : ${msg.author} (${msg.author.id})\n` +
        `📌 Salon : ${msg.channel}\n` +
        `⛔ Timeout : ${client.config.timeoutMinutes} minutes`
      );

      msg.member.timeout(client.config.timeoutMinutes * 60 * 1000, "Spam").catch(() => {});
      spamMap.set(userId, []);
    }
  });

  // =========================
  // ANTI-RAID
  // =========================
  const joinTimes = [];

  client.on("guildMemberAdd", member => {
    const now = Date.now();
    joinTimes.push(now);

    const recent = joinTimes.filter(t => now - t < client.config.raidSeconds * 1000);
    joinTimes.length = 0;
    joinTimes.push(...recent);

    if (recent.length >= client.config.raidThreshold) {
      const logs = client.channels.cache.get(client.config.logRaid);
      if (logs) logs.send(
        `🚨 **ANTI-RAID ACTIVÉ**\n` +
        `📌 ${recent.length} joins en ${client.config.raidSeconds}s`
      );
    }
  });

  // =========================
  // ANTI-BOT
  // =========================
  client.on("guildMemberAdd", member => {
    if (member.user.bot) {
      const logs = client.channels.cache.get(client.config.logBot);
      if (logs) logs.send(
        `🤖 **Bot détecté :** ${member.user.tag} (${member.id})`
      );
    }
  });

  // =========================
  // BLACKLIST création salons / rôles
  // =========================
  const trackCreate = { channels: [], roles: [] };

  function limit(array, userId) {
    array.push({ userId, time: Date.now() });
    return array.filter(x => Date.now() - x.time < 3600000);
  }

  client.on("channelCreate", ch => {
    ch.guild.fetchAuditLogs({ type: 10, limit: 1 }).then(logs => {
      const entry = logs.entries.first();
      if (!entry) return;
      const userId = entry.executor.id;

      trackCreate.channels = limit(trackCreate.channels, userId);

      if (trackCreate.channels.filter(x => x.userId === userId).length >= 10) {
        const logsChan = client.channels.cache.get(client.config.logBlacklist);
        if (logsChan) logsChan.send(
          `⛔ **BLACKLIST - création massive de salons**\n` +
          `👤 ${entry.executor} (${userId})`
        );
        ch.guild.members.ban(userId, { reason: "Raid salons" }).catch(() => {});
      }
    });
  });

  client.on("roleCreate", role => {
    role.guild.fetchAuditLogs({ type: 30, limit: 1 }).then(logs => {
      const entry = logs.entries.first();
      if (!entry) return;
      const userId = entry.executor.id;

      trackCreate.roles = limit(trackCreate.roles, userId);

      if (trackCreate.roles.filter(x => x.userId === userId).length >= 10) {
        const logsChan = client.channels.cache.get(client.config.logBlacklist);
        if (logsChan) logsChan.send(
          `⛔ **BLACKLIST - création massive de rôles**\n` +
          `👤 ${entry.executor} (${userId})`
        );
        role.guild.members.ban(userId, { reason: "Raid rôles" }).catch(() => {});
      }
    });
  });

};
