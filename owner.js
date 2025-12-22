module.exports = {
  name: "owner",
  async run(client, message, args) {
    if (message.guild.ownerId !== message.author.id) {
      return message.reply("❌ Seul le propriétaire du serveur peut utiliser cette commande.");
    }

    if (!args.length) {
      return message.reply(
        "**👑 Commandes Owner disponibles :**\n" +
        "`+owner say <msg>` → Faire dire un message au bot\n" +
        "`+owner shutdown` → Éteindre le bot"
      );
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

    return message.reply("❌ Sous-commande owner inconnue.");
  }
};
