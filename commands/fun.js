module.exports = {
  name: "fun",
  async run(client, message, args) {
    if (!args.length) {
      return message.reply("🎉 Commandes fun : ping, dice, coinflip, avatar");
    }

    const sub = args[0].toLowerCase();

    if (sub === "ping") {
      // ✅ return pour éviter l'exécution multiple
      return message.reply(`🏓 Pong ! ${client.ws.ping}ms`);
    }

    if (sub === "dice") {
      // ✅ return pour éviter l'exécution multiple
      const roll = Math.floor(Math.random() * 6) + 1;
      return message.reply(`🎲 Tu as lancé un **${roll}**`);
    }

    if (sub === "coinflip") {
      // ✅ return pour éviter l'exécution multiple
      const result = Math.random() < 0.5 ? "Pile" : "Face";
      return message.reply(`🪙 Résultat : **${result}**`);
    }

    if (sub === "avatar") {
      // ✅ return pour éviter l'exécution multiple
      const user = message.mentions.users.first() || message.author;
      return message.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    }

    // Sous-commande inconnue
    return message.reply("❌ Sous-commande fun inconnue.");
  }
};
