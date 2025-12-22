module.exports = {
  name: "owner",
  async run(client, message, args) {
    if (message.guild.ownerId !== message.author.id) {
      return message.reply("❌ Seul le propriétaire du serveur peut utiliser cette commande.");
    }

    if (!args.length) {
      return message.reply({
        embeds: [{
          title: "👑 Commandes Owner",
          color: 0x9B59B6,
          description: `
\`+owner say <msg>\` → Faire dire un message au bot
\`+owner shutdown\` → Éteindre le bot
\`+owner restart\` → Redémarrer le bot
\`+owner announce <msg>\` → Annoncer dans le serveur
\`+owner nickname <@user> <nom>\` → Changer un pseudo
\`+owner kick <@user>\` → Expulser un membre
\`+owner ban <@user>\` → Bannir un membre
\`+owner unban <userID>\` → Débannir
\`+owner role <add|remove> <@user> <role>\` → Ajouter/retirer rôle
\`+owner stats\` → Statistiques du serveur
          `
        }]
      });
    }

    const sub = args[0].toLowerCase();

    if (sub === "say") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Message manquant.");
      return message.channel.send(text);
    }

    if (sub === "shutdown") {
      await message.reply("🛑 Arrêt du bot...");
      process.exit(0);
    }

    if (sub === "restart") {
      await message.reply("🔄 Redémarrage du bot...");
      process.exit(1);
    }

    if (sub === "announce") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Message manquant.");
      const channel = message.guild.systemChannel || message.channel;
      return channel.send(`📢 Annonce : ${text}`);
    }

    if (sub === "nickname") {
      const member = message.mentions.members.first();
      const newName = args.slice(2).join(" ");
      if (!member || !newName) return message.reply("❌ Usage : +owner nickname @user <nom>");
      await member.setNickname(newName).catch(() => {});
      return message.reply(`✅ Pseudo de ${member.user.tag} changé en **${newName}**`);
    }

    if (sub === "kick") {
      const member = message.mentions.members.first();
      if (!member) return message.reply("❌ Mentionne un membre à expulser !");
      await member.kick().catch(() => {});
      return message.reply(`✅ ${member.user.tag} expulsé.`);
    }

    if (sub === "ban") {
      const member = message.mentions.members.first();
      if (!member) return message.reply("❌ Mentionne un membre à bannir !");
      await member.ban().catch(() => {});
      return message.reply(`✅ ${member.user.tag} banni.`);
    }

    if (sub === "unban") {
      const userId = args[1];
      if (!userId) return message.reply("❌ Fournis un ID utilisateur !");
      await message.guild.members.unban(userId).catch(() => {});
      return message.reply(`✅ Utilisateur ${userId} débanni.`);
    }

    if (sub === "role") {
      const action = args[1]?.toLowerCase();
      const member = message.mentions.members.first();
      const roleName = args.slice(3).join(" ");
      if (!member || !roleName || !["add","remove"].includes(action)) return message.reply("❌ Usage : +owner role <add|remove> @user <role>");
      const role = message.guild.roles.cache.find(r => r.name === roleName);
      if (!role) return message.reply("❌ Rôle introuvable !");
      if (action === "add") await member.roles.add(role).catch(() => {});
      else await member.roles.remove(role).catch(() => {});
      return message.reply(`✅ Rôle ${roleName} ${action} pour ${member.user.tag}`);
    }

    if (sub === "stats") {
      const members = message.guild.memberCount;
      const channels = message.guild.channels.cache.size;
      const roles = message.guild.roles.cache.size;
      return message.reply(`📊 Statistiques : ${members} membres | ${channels} channels | ${roles} rôles`);
    }

    return message.reply("❌ Sous-commande owner inconnue.");
  }
};
