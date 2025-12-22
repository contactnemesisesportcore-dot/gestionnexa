module.exports = {
  name: "owner",

  run: async (client, message, args) => {
    // SEUL LE PROPRIÉTAIRE DU SERVEUR
    if (message.author.id !== message.guild.ownerId) {
      return message.reply("❌ Cette commande est réservée au propriétaire du serveur.");
    }

    // +owner
    if (!args[0]) {
      return message.reply(
        "**👑 Commandes Owner :**\n" +
        "`+owner info` → Infos bot\n" +
        "`+owner say <message>` → Parler via le bot\n" +
        "`+owner shutdown` → Éteindre le bot"
      );
    }

    // +owner info
    if (args[0] === "info") {
      return message.reply(
        `🤖 **Infos Bot**\n` +
        `• Nom : ${client.user.username}\n` +
        `• Serveurs : ${client.guilds.cache.size}\n` +
        `• Ping : ${client.ws.ping}ms`
      );
    }

    // +owner say
    if (args[0] === "say") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Tu dois écrire un message.");
      return message.channel.send(text);
    }

    // +owner shutdown
    if (args[0] === "shutdown") {
      await message.reply("🛑 Arrêt du bot...");
      process.exit(0);
    }

    return message.reply("❌ Sous-commande inconnue.");
  }
};
