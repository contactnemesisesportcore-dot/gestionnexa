const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "fun",

  run: async (client, message, args) => {

    // =========================
    // MENU FUN
    // =========================
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor("#8A2BE2") // violet
        .setTitle("🎉 Commandes FUN")
        .setDescription(
          "**Voici toutes les commandes fun disponibles :**\n\n" +
          "`+fun ping` → Latence du bot\n" +
          "`+fun avatar [@user]` → Avatar d’un membre\n" +
          "`+fun dice` → Lance un dé 🎲\n" +
          "`+fun coinflip` → Pile ou face\n" +
          "`+fun 8ball` → Question magique 🔮\n" +
          "`+fun joke` → Blague\n" +
          "`+fun say <texte>` → Le bot répète\n"
        )
        .setFooter({ text: "NexaBot • Fun System" });

      return message.channel.send({ embeds: [embed] });
    }

    // =========================
    // PING
    // =========================
    if (args[0] === "ping") {
      return message.reply(
        `🏓 **Pong !**\nLatence : **${client.ws.ping}ms**`
      );
    }

    // =========================
    // AVATAR
    // =========================
    if (args[0] === "avatar") {
      const user = message.mentions.users.first() || message.author;

      const embed = new EmbedBuilder()
        .setColor("#8A2BE2")
        .setTitle(`🖼️ Avatar de ${user.username}`)
        .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }));

      return message.channel.send({ embeds: [embed] });
    }

    // =========================
    // DICE
    // =========================
    if (args[0] === "dice") {
      const result = Math.floor(Math.random() * 6) + 1;
      return message.reply(`🎲 Tu as lancé un **${result}** !`);
    }

    // =========================
    // COINFLIP
    // =========================
    if (args[0] === "coinflip") {
      const result = Math.random() < 0.5 ? "Pile 🪙" : "Face 🪙";
      return message.reply(`🪙 Résultat : **${result}**`);
    }

    // =========================
    // 8BALL
    // =========================
    if (args[0] === "8ball") {
      const replies = [
        "Oui ✅",
        "Non ❌",
        "Peut-être 🤔",
        "Très probable 🔥",
        "Impossible ❄️"
      ];
      const answer = replies[Math.floor(Math.random() * replies.length)];
      return message.reply(`🔮 **La boule magique dit :** ${answer}`);
    }

    // =========================
    // JOKE
    // =========================
    if (args[0] === "joke") {
      return message.reply(
        "😂 Pourquoi les développeurs aiment JavaScript ?\nParce qu’ils peuvent *callback* plus tard."
      );
    }

    // =========================
    // SAY
    // =========================
    if (args[0] === "say") {
      const text = args.slice(1).join(" ");
      if (!text) {
        return message.reply("❌ Tu dois fournir un message.");
      }
      return message.channel.send(text);
    }

    // =========================
    // SOUS-COMMANDE INCONNUE
    // =========================
    return message.reply(
      "❌ Sous-commande inconnue.\nFais `+fun` pour voir la liste."
    );
  }
};
