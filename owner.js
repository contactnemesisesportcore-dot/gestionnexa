const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "owner",
  description: "Commandes réservées au propriétaire du serveur",
  run: async (client, message, args) => {

    // 🔐 Vérification OWNER serveur
    if (message.guild.ownerId !== message.author.id) {
      return message.reply("❌ Cette commande est réservée au **propriétaire du serveur**.");
    }

    const sub = args[0];

    // ===============================
    // 📖 AIDE OWNER
    // ===============================
    if (!sub) {
      const embed = new EmbedBuilder()
        .setColor("#8b5cf6") // violet
        .setTitle("👑 Commandes Owner")
        .setDescription(`
Voici les commandes **réservées au propriétaire du serveur** :

🔧 **Gestion**
\`+owner maintenance on\`
\`+owner maintenance off\`

🧹 **Bot**
\`+owner clearbot\`
\`+owner restart\`

📢 **Annonce**
\`+owner say <message>\`

ℹ️ **Infos**
\`+owner info\`
        `)
        .setFooter({ text: "Accès strictement réservé au propriétaire" });

      return message.reply({ embeds: [embed] });
    }

    // ===============================
    // 🛠️ MAINTENANCE ON/OFF
    // ===============================
    if (sub === "maintenance") {
      const state = args[1];
      if (!state || !["on", "off"].includes(state)) {
        return message.reply("❌ Utilisation : `+owner maintenance on/off`");
      }

      client.maintenance = state === "on";

      return message.reply(
        state === "on"
          ? "🚧 **Maintenance activée**"
          : "✅ **Maintenance désactivée**"
      );
    }

    // ===============================
    // 🧹 CLEAR MESSAGES BOT
    // ===============================
    if (sub === "clearbot") {
      const messages = await message.channel.messages.fetch({ limit: 50 });
      const botMessages = messages.filter(m => m.author.id === client.user.id);

      await message.channel.bulkDelete(botMessages, true);
      return message.reply("🧹 Messages du bot supprimés.");
    }

    // ===============================
    // 🔄 RESTART BOT
    // ===============================
    if (sub === "restart") {
      await message.reply("🔄 Redémarrage du bot...");
      process.exit(0);
    }

    // ===============================
    // 📢 SAY
    // ===============================
    if (sub === "say") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Message manquant.");

      await message.delete();
      return message.channel.send(text);
    }

    // ===============================
    // ℹ️ INFO BOT
    // ===============================
    if (sub === "info") {
      const embed = new EmbedBuilder()
        .setColor("#8b5cf6")
        .setTitle("ℹ️ Informations Bot")
        .addFields(
          { name: "👑 Owner", value: `<@${message.guild.ownerId}>`, inline: true },
          { name: "🧠 Node.js", value: process.version, inline: true },
          { name: "📦 Discord.js", value: require("discord.js").version, inline: true }
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // ===============================
    // ❌ COMMANDE INCONNUE
    // ===============================
    return message.reply("❌ Sous-commande inconnue. Fais `+owner`.");
  }
};
