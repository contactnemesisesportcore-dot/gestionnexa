module.exports = {
  name: "moderation",
  description: "Commandes de modération",
  category: "moderation",

  async run(client, message, args) {
    if (!message.member.permissions.has("ModerateMembers")) {
      return message.reply("❌ Permission refusée.");
    }

    const sub = args[0];
    const member = message.mentions.members.first();

    if (!sub) {
      return message.reply(
        "**🛡️ Modération :**\n" +
        "`clear, warn, warns, unwarn, mute, unmute, kick, ban, unban`"
      );
    }

    switch (sub) {
      case "clear":
        return message.channel.bulkDelete(Number(args[1]) || 1);

      case "warn":
        return message.reply(`⚠️ ${member} averti`);

      case "kick":
        await member.kick();
        return message.reply(`👢 ${member.user.tag} expulsé`);

      case "ban":
        await member.ban();
        return message.reply(`🔨 ${member.user.tag} banni`);

      default:
        return message.reply("❌ Modération inconnue.");
    }
  }
};
