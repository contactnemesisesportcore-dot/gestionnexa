// ===============================
// MODULE MAINTENANCE AUTO
// ===============================

const MAINTENANCE_START = 18; // 18h
const MAINTENANCE_END = 23;   // 23h

// Salons bloqués pendant la maintenance
const BLOCKED_CHANNELS = [
  "1443299798223556730",
  "1443299804028600491",
  "1443299807367135332",
  "1447329675495079988",
  "1443299821648871575",
  "1451939221865496626",
  "1443299824924364840"
];

module.exports.init = (client) => {
  client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (!BLOCKED_CHANNELS.includes(message.channel.id)) return;

    const now = new Date();
    const hour = now.getHours();

    // Vérifie si on est dans la plage de maintenance
    const inMaintenance =
      hour >= MAINTENANCE_START && hour < MAINTENANCE_END;

    if (!inMaintenance) return;

    try {
      // Supprime le message
      await message.delete();

      // Message d'information du bot
      const warning = await message.channel.send({
        content: `🚧 **Maintenance en cours** 🚧

❌ Il est **interdit d’écrire dans ce salon** entre **18h et 23h**.

🕒 **Fin de la maintenance : 23h**
Merci de patienter.`,
      });

      // Auto-suppression du message du bot après 10 secondes
      setTimeout(() => {
        warning.delete().catch(() => {});
      }, 10000);

    } catch (err) {
      console.error("Erreur maintenance :", err);
    }
  });

  console.log("🛠️ Module maintenance activé (18h → 23h)");
};
