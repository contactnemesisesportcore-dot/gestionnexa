const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "fun",
  description: "Affiche toutes les commandes fun",

  run(client, message) {
    const embed = new EmbedBuilder()
      .setColor("#8A2BE2") // violet
      .setTitle("🎉 Commandes Fun")
      .setDescription(
        "**Voici les commandes fun disponibles :**\n\n" +
        "🏓 `+ping` — Affiche la latence du bot\n" +
        "🖼️ `+avatar [@membre]` — Avatar d’un membre\n" +
        "😂 `+blague` — Blague aléatoire\n" +
        "🎲 `+dice` — Lance un dé\n" +
        "🎱 `+8ball <question>` — Réponse magique\n"
      )
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setFooter({ text: "Nexa • Fun Commands" });

    message.reply({ embeds: [embed] });
  }
};
