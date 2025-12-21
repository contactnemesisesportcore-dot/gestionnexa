// ===============================
// MODULE MAINTENANCE AUTO
// ===============================

const BLOCKED_CHANNELS = [
  "1443299798223556730",
  "1443299804028600491",
  "1443299807367135332",
  "1447329675495079988",
  "1443299821648871575",
  "1451939221865496626",
  "1443299824924364840"
];

let maintenanceActive = false; // Variable pour activer/désactiver la maintenance

module.exports.init = (client) => {
  // Gestion des messages dans les salons bloqués
  client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;

    const content = message.content.trim();

    // Gestion de la commande +maintenance
    if (content.startsWith("+maintenance")) {
      // Vérifie que l'utilisateur a la permission de gérer le serveur
      if (!message.member.permissions.has("MANAGE_GUILD")) {
        return message.reply("❌ Vous n'avez pas la permission d'utiliser cette commande.");
      }

      const args = content.split(" ").slice(1);
      if (args.length === 0) {
        return message.reply("❌ Utilisation : `+maintenance on` ou `+maintenance off`");
      }

      const state = args[0].toLowerCase();
      if (state === "on") {
        maintenanceActive = true;
        return message.channel.send("🛠️ Maintenance activée !");
      } else if (state === "off") {
        maintenanceActive = false;
        return message.channel.send("✅ Maintenance désactivée !");
      } else {
        return message.reply("❌ Utilisation : `+maintenance on` ou `+maintenance off`");
      }
    }

    // Blocage des messages si maintenance active dans les channels bloqués
    if (!BLOCKED_CHANNELS.includes(message.channel.id)) return;
    if (!maintenanceActive) return;

    try {
      // Supprime le message
      await message.delete();

      // Message d'avertissement
      const warning = await message.channel.send({
        content: `🚧 **Maintenance en cours** 🚧\n\n❌ Il est **interdit d’écrire dans ce salon** pour le moment.\nMerci de patienter.`,
      });

      // Supprime automatiquement après 10 secondes
      setTimeout(() => {
        warning.delete().catch(() => {});
      }, 10000);

    } catch (err) {
      console.error("Erreur maintenance :", err);
    }
  });

  console.log("🛠️ Module maintenance prêt (+maintenance on/off).");
};
