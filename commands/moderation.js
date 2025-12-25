const { PermissionsBitField } = require("discord.js");

const warns = new Map(); // stockage simple en mémoire

module.exports = {
  name: "moderation",

  run: async (client, message, args) => {
    if (!message.guild || message.author.bot) return;

    const cmd = args.shift()?.toLowerCase();
    if (!cmd) return;

    // =========================
    // 🔨 BAN
    // =========================
    if (cmd === "ban") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
        return message.reply("❌ Permission refusée.");

      const member = message.mentions.members.first();
      if (!member) return message.reply("❌ Mentionne un membre.");

      const reason = args.join(" ") || "Aucune raison fournie";

      await member.ban({ reason }).catch(() =>
        message.reply("❌ Impossible de bannir ce membre.")
      );

      return message.reply(`🔨 **${member.user.tag}** banni.\n📄 Raison : ${reason}`);
    }

    // =========================
    // 👢 KICK
    // =========================
    if (cmd === "kick") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
        return message.reply("❌ Permission refusée.");

      const member = message.mentions.members.first();
      if (!member) return message.reply("❌ Mentionne un membre.");

      const reason = args.join(" ") || "Aucune raison fournie";

      await member.kick(reason).catch(() =>
        message.reply("❌ Impossible de kick ce membre.")
      );

      return message.reply(`👢 **${member.user.tag}** kick.\n📄 Raison : ${reason}`);
    }

    // =========================
    // 🔇 MUTE (TIMEOUT)
    // =========================
    if (cmd === "mute") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
        return message.reply("❌ Permission refusée.");

      const member = message.mentions.members.first();
      const minutes = parseInt(args[1]);

      if (!member || !minutes)
        return message.reply("❌ Usage : `+moderation mute @membre <minutes>`");

      await member.timeout(minutes * 60 * 1000).catch(() =>
        message.reply("❌ Impossible de mute.")
      );

      return message.reply(`🔇 **${member.user.tag}** mute pendant **${minutes} min**.`);
    }

    // =========================
    // 🔊 UNMUTE
    // =========================
    if (cmd === "unmute") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
        return message.reply("❌ Permission refusée.");

      const member = message.mentions.members.first();
      if (!member) return message.reply("❌ Mentionne un membre.");

      await member.timeout(null).catch(() =>
        message.reply("❌ Impossible d’unmute.")
      );

      return message.reply(`🔊 **${member.user.tag}** n'est plus mute.`);
    }

    // =========================
    // ⚠ WARN
    // =========================
    if (cmd === "warn") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return message.reply("❌ Permission refusée.");

      const member = message.mentions.members.first();
      if (!member) return message.reply("❌ Mentionne un membre.");

      const reason = args.join(" ") || "Aucune raison";
      const userWarns = warns.get(member.id) || [];
      userWarns.push(reason);
      warns.set(member.id, userWarns);

      return message.reply(
        `⚠ **${member.user.tag}** averti.\n📄 Raison : ${reason}\n📊 Total warns : ${userWarns.length}`
      );
    }

    // =========================
    // 🧹 CLEAR
    // =========================
    if (cmd === "clear") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
        return message.reply("❌ Permission refusée.");

      const amount = parseInt(args[0]);
      if (!amount || amount < 1 || amount > 100)
        return message.reply("❌ Nombre entre 1 et 100.");

      await message.channel.bulkDelete(amount, true);
      return message.channel.send(`🧹 **${amount} messages supprimés.**`)
        .then(msg => setTimeout(() => msg.delete(), 3000));
    }

    // =========================
    // 🔒 LOCK
    // =========================
    if (cmd === "lock") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply("❌ Permission refusée.");

      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: false }
      );

      return message.reply("🔒 Salon verrouillé.");
    }

    // =========================
    // 🔓 UNLOCK
    // =========================
    if (cmd === "unlock") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply("❌ Permission refusée.");

      await message.channel.permissionOverwrites.edit(
        message.guild.roles.everyone,
        { SendMessages: true }
      );

      return message.reply("🔓 Salon déverrouillé.");
    }

    // =========================
    // 🐢 SLOWMODE
    // =========================
    if (cmd === "slowmode") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
        return message.reply("❌ Permission refusée.");

      const seconds = parseInt(args[0]);
      if (isNaN(seconds) || seconds < 0 || seconds > 21600)
        return message.reply("❌ Temps invalide (0–21600 sec).");

      await message.channel.setRateLimitPerUser(seconds);
      return message.reply(`🐢 Slowmode réglé à **${seconds} secondes**.`);
    }
  }
};
