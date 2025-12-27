const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "stats",
  description: "Statistiques",
  category: "stats",

  async run(client, message, args) {
    const sub = args[0];

    if (!sub) {
      return message.reply(
        "**📊 Stats disponibles :**\n" +
        "`server, user, bot, roles, channels, voice, boosts, emojis, online`"
      );
    }

    const embed = new EmbedBuilder().setColor("Blue");

    switch (sub) {
      case "server":
        embed.setTitle("📊 Serveur")
          .addFields(
            { name: "Membres", value: `${message.guild.memberCount}` },
            { name: "Salons", value: `${message.guild.channels.cache.size}` }
          );
        break;

      case "user":
        embed.setTitle("👤 Utilisateur")
          .addFields({ name: "Nom", value: message.author.tag });
        break;

      case "bot":
        embed.setTitle("🤖 Bot")
          .addFields({ name: "Ping", value: `${client.ws.ping}ms` });
        break;

      default:
        return message.reply("❌ Stat inconnue.");
    }

    message.reply({ embeds: [embed] });
  }
};
