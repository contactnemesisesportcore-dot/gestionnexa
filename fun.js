module.exports = {
  name: "fun",

  run: async (client, message, args) => {

    // +fun
    if (!args[0]) {
      return message.reply(
        "**🎉 Commandes Fun :**\n" +
        "`+fun ping` → Ping du bot\n" +
        "`+fun avatar` → Avatar\n" +
        "`+fun say <msg>` → Le bot parle"
      );
    }

    // +fun ping
    if (args[0] === "ping") {
      return message.reply(`🏓 Pong ! ${client.ws.ping}ms`);
    }

    // +fun avatar
    if (args[0] === "avatar") {
      const user = message.mentions.users.first() || message.author;
      return message.reply(user.displayAvatarURL({ dynamic: true, size: 512 }));
    }

    // +fun say
    if (args[0] === "say") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Écris un message.");
      return message.channel.send(text);
    }

    return message.reply("❌ Commande fun inconnue.");
  }
};
