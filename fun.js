module.exports = {
  name: "fun", // la commande principale
  async run(client, message, args) {
    // Si l'utilisateur tape juste +fun
    if (!args.length) {
      return message.reply(
        "**🎉 Commandes Fun disponibles :**\n" +
        "`+fun ping` → Ping du bot\n" +
        "`+fun avatar` → Avatar d'un membre\n" +
        "`+fun dice` → Lance un dé\n" +
        "`+fun coinflip` → Pile ou face"
      );
    }

    const sub = args[0].toLowerCase();

    if (sub === "ping") {
      return message.reply(`🏓 Pong ! ${client.ws.ping}ms`);
    }

    if (sub === "avatar") {
      const user = message.mentions.users.first() || message.author;
      return message.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    }

    if (sub === "dice") {
      const roll = Math.floor(Math.random() * 6) + 1;
      return message.reply(`🎲 Tu as lancé un **${roll}**`);
    }

    if (sub === "coinflip") {
      const result = Math.random() < 0.5 ? "Pile" : "Face";
      return message.reply(`🪙 Résultat : **${result}**`);
    }

    // Sous-commande inconnue
    return message.reply("❌ Sous-commande fun inconnue.");
  }
};
