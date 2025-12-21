const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "fun",
  description: "Commandes fun",
  run(client, message, args) {

    const sub = args[0];
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setFooter({ text: "NexaBot • Fun" });

    if (!sub) {
      embed
        .setTitle("🎉 Commandes Fun")
        .setDescription(`
+fun 8ball
+fun dice
+fun coinflip
+fun hug @user
+fun kiss @user
+fun slap @user
+fun love @user
+fun say <texte>
+fun joke
+fun avatar [@user]
+fun ping
        `);
      return message.channel.send({ embeds: [embed] });
    }

    switch (sub.toLowerCase()) {

      case "8ball":
        embed.setTitle("🎱 8Ball")
          .setDescription(["Oui", "Non", "Peut-être", "Certainement", "Jamais", "Reviens plus tard"][Math.floor(Math.random()*6)]);
        break;

      case "dice":
        embed.setTitle("🎲 Dé")
          .setDescription(`Résultat : **${Math.floor(Math.random()*6)+1}**`);
        break;

      case "coinflip":
        embed.setTitle("🪙 Pile ou Face")
          .setDescription(Math.random() < 0.5 ? "Pile" : "Face");
        break;

      case "hug": {
        const user = message.mentions.users.first();
        if (!user) return message.reply("❌ Mentionne quelqu’un.");
        embed.setTitle("🤗 Câlin")
          .setDescription(`${message.author.username} fait un câlin à ${user.username}`);
        break;
      }

      case "kiss": {
        const user = message.mentions.users.first();
        if (!user) return message.reply("❌ Mentionne quelqu’un.");
        embed.setTitle("💋 Bisou")
          .setDescription(`${message.author.username} embrasse ${user.username}`);
        break;
      }

      case "slap": {
        const user = message.mentions.users.first();
        if (!user) return message.reply("❌ Mentionne quelqu’un.");
        embed.setTitle("👋 Slap")
          .setDescription(`${message.author.username} gifle ${user.username}`);
        break;
      }

      case "love": {
        const user = message.mentions.users.first();
        if (!user) return message.reply("❌ Mentionne quelqu’un.");
        embed.setTitle("❤️ Love")
          .setDescription(`Compatibilité : **${Math.floor(Math.random()*100)}%**`);
        break;
      }

      case "say":
        if (args.length < 2) return message.reply("❌ Tu dois écrire un message.");
        embed.setTitle("💬 Say").setDescription(args.slice(1).join(" "));
        break;

      case "joke":
        embed.setTitle("😂 Blague")
          .setDescription("Pourquoi les développeurs aiment le noir ? Parce que la lumière attire les bugs.");
        break;

      case "avatar": {
        const user = message.mentions.users.first() || message.author;
        embed.setTitle(`🖼️ Avatar de ${user.username}`)
          .setImage(user.displayAvatarURL({ size: 512 }));
        break;
      }

      case "ping":
        embed.setTitle("🏓 Ping")
          .setDescription(`Latence : **${client.ws.ping}ms**`);
        break;

      default:
        return message.reply("❌ Sous-commande inconnue. Tape `+fun`.");
    }

    message.channel.send({ embeds: [embed] });
  }
};
