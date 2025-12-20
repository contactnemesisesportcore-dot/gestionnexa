const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "fun",
  description: "Commandes fun pour divertir vos membres",
  execute(message, args) {
    const sub = args[0];
    const embed = new EmbedBuilder().setColor("Random");

    if (!sub) {
      embed.setTitle("🎉 Commandes Fun Disponibles")
        .setDescription("`8ball`, `coinflip`, `dice`, `hug`, `kiss`, `love`, `say`, `joke`")
        .setFooter({ text: "NexaBot • Fun" });
      return message.channel.send({ embeds: [embed] });
    }

    switch(sub.toLowerCase()) {
      case "8ball":
        const responses = ["Oui", "Non", "Peut-être", "Certainement", "Jamais", "Impossible", "Demande plus tard"];
        embed.setTitle("🎱 8Ball")
          .setDescription(responses[Math.floor(Math.random() * responses.length)]);
        break;

      case "coinflip":
        embed.setTitle("🪙 Coin Flip")
          .setDescription(Math.random() < 0.5 ? "Pile" : "Face");
        break;

      case "dice":
        embed.setTitle("🎲 Dice")
          .setDescription(`Tu as fait **${Math.floor(Math.random()*6)+1}**`);
        break;

      case "hug":
        const hugUser = message.mentions.users.first();
        if(!hugUser) return message.reply("❌ Mentionne quelqu’un pour faire un câlin.");
        embed.setTitle("🤗 Câlin")
          .setDescription(`${message.author.username} fait un câlin à ${hugUser.username}`);
        break;

      case "kiss":
        const kissUser = message.mentions.users.first();
        if(!kissUser) return message.reply("❌ Mentionne quelqu’un pour envoyer un bisou.");
        embed.setTitle("💋 Bisou")
          .setDescription(`${message.author.username} envoie un bisou à ${kissUser.username}`);
        break;

      case "love":
        const loveUser = message.mentions.users.first();
        if(!loveUser) return message.reply("❌ Mentionne quelqu’un pour calculer l'amour.");
        embed.setTitle("❤️ Love Calculator")
          .setDescription(`${message.author.username} aime ${loveUser.username} à **${Math.floor(Math.random()*100)}%**`);
        break;

      case "say":
        if(!args[1]) return message.reply("❌ Tu dois écrire quelque chose.");
        embed.setTitle("💬 Say")
          .setDescription(args.slice(1).join(" "));
        break;

      case "joke":
        const jokes = [
          "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau !",
          "Pourquoi les mathématiciens sont-ils mauvais en natation ? Parce qu’ils nagent dans des nombres imaginaires !",
          "Pourquoi les programmeurs confondent Halloween et Noël ? Parce que OCT 31 = DEC 25."
        ];
        embed.setTitle("😂 Blague")
          .setDescription(jokes[Math.floor(Math.random() * jokes.length)]);
        break;

      default:
        return message.channel.send("❌ Sous-commande inconnue. Tape `+fun` pour voir toutes les sous-commandes.");
    }

    message.channel.send({ embeds: [embed] });
  }
};
