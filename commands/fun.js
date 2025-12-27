const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "fun",
  description: "Commandes fun",
  category: "fun",

  async run(client, message, args) {
    const sub = args[0];

    if (!sub) {
      return message.reply(
        "**🎉 Fun disponibles :**\n" +
        "`ping, avatar, say, roll, 8ball, hug, slap, coinflip`"
      );
    }

    switch (sub) {
      case "ping":
        return message.reply(`🏓 Pong : ${client.ws.ping}ms`);

      case "avatar": {
        const user = message.mentions.users.first() || message.author;
        return message.reply(user.displayAvatarURL({ size: 1024 }));
      }

      case "say":
        return message.channel.send(args.slice(1).join(" "));

      case "roll":
        return message.reply(`🎲 ${Math.floor(Math.random() * 100) + 1}`);

      case "8ball":
        return message.reply("🎱 Oui.");

      case "hug":
        return message.reply(`🤗 ${message.author} fait un câlin`);

      case "slap":
        return message.reply(`👋 ${message.author} met une gifle`);

      case "coinflip":
        return message.reply(Math.random() < 0.5 ? "🪙 Pile" : "🪙 Face");

      default:
        return message.reply("❌ Sous-commande fun inconnue.");
    }
  }
};
