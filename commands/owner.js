const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "owner",
  description: "Commandes réservées au propriétaire",

  async run(client, message, args) {

    // 🔐 SÉCURITÉ OWNER
    if (message.guild.ownerId !== message.author.id) {
      return message.reply("❌ Cette commande est réservée au propriétaire du serveur.");
    }

    // ===============================
    // 📜 MENU OWNER
    // ===============================
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor("#ff3c6e")
        .setTitle("👑 Commandes OWNER")
        .setDescription(
          "`+owner say <texte>` → Le bot parle\n" +
          "`+owner status <texte>` → Change le statut\n" +
          "`+owner maintenance on/off`\n" +
          "`+owner restart`\n" +
          "`+owner shutdown`\n"
        )
        .setFooter({ text: "Accès propriétaire uniquement" });

      return message.reply({ embeds: [embed] });
    }

    const sub = args[0].toLowerCase();

    // ===============================
    // 🗣 SAY
    // ===============================
    if (sub === "say") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Texte manquant.");
      return message.channel.send(text);
    }

    // ===============================
    // 🎮 STATUS
    // ===============================
    if (sub === "status") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Statut manquant.");

      client.user.setActivity(text);
      return message.reply("✅ Statut mis à jour.");
    }

    // ===============================
    // 🛠 MAINTENANCE
    // ===============================
    if (sub === "maintenance") {
      const state = args[1];
      if (!["on", "off"].includes(state)) {
        return message.reply("❌ Utilise `+owner maintenance on/off`");
      }

      return message.reply(
        state === "on"
          ? "🛠 Maintenance **ACTIVÉE**"
          : "✅ Maintenance **DÉSACTIVÉE**"
      );
    }

    // ===============================
    // 🔁 RESTART
    // ===============================
    if (sub === "restart") {
      await message.reply("🔁 Redémarrage du bot...");
      process.exit(0);
    }

    // ===============================
    // ⛔ SHUTDOWN
    // ===============================
    if (sub === "shutdown") {
      await message.reply("⛔ Arrêt du bot.");
      process.exit(0);
    }

    return message.reply("❌ Sous-commande owner inconnue. Fais `+owner`.");
  }
};
