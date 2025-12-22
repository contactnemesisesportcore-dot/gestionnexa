const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "owner",

  async run(client, message, args) {
    // 🔐 sécurité : owner du serveur uniquement
    if (message.guild.ownerId !== message.author.id) {
      return message.reply("❌ Cette commande est réservée au propriétaire du serveur.");
    }

    const sub = args[0]?.toLowerCase();

    // =========================
    // +owner
    // =========================
    if (!sub) {
      const embed = new EmbedBuilder()
        .setColor("#8b5cf6")
        .setTitle("👑 Commandes Owner")
        .setDescription(
          "**Commandes disponibles :**\n\n" +
          "`+owner info`\n" +
          "`+owner maintenance on/off`\n" +
          "`+owner restart`\n" +
          "`+owner shutdown`"
        );

      return message.reply({ embeds: [embed] });
    }

    // =========================
    // +owner info
    // =========================
    if (sub === "info") {
      const embed = new EmbedBuilder()
        .setColor("#8b5cf6")
        .setTitle("ℹ️ Informations du bot")
        .addFields(
          { name: "Nom", value: client.user.username, inline: true },
          { name: "Serveurs", value: `${client.guilds.cache.size}`, inline: true },
          { name: "Ping", value: `${client.ws.ping}ms`, inline: true }
        );

      return message.reply({ embeds: [embed] });
    }

    // =========================
    // +owner maintenance on/off
    // =========================
    if (sub === "maintenance") {
      const state = args[1];

      if (!["on", "off"].includes(state)) {
        return message.reply("❌ Utilisation : `+owner maintenance on/off`");
      }

      client.maintenance = state === "on";

      return message.reply(
        `🛠️ Maintenance **${state === "on" ? "activée" : "désactivée"}**.`
      );
    }

    // =========================
    // +owner restart
    // =========================
    if (sub === "restart") {
      await message.reply("♻️ Redémarrage du bot...");
      process.exit(0);
    }

    // =========================
    // +owner shutdown
    // =========================
    if (sub === "shutdown") {
      await message.reply("🛑 Arrêt du bot...");
      process.exit(1);
    }

    // =========================
    // Inconnu
    // =========================
    return message.reply("❌ Sous-commande inconnue. Fais `+owner`.");
  }
};
