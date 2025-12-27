// =====================================================
// 🔒 MAINTENANCE AUTOMATIQUE — SERVEUR INACCESSIBLE
// ⏰ 01h00 → 03h30
// 🚨 Mode urgence avec clé (OWNER ONLY)
// Discord.js v14
// =====================================================

const {
  ActivityType,
  EmbedBuilder
} = require("discord.js");

// ===============================
// CONFIG HORAIRES
// ===============================
const START_HOUR = 1;
const START_MINUTE = 0;

const END_HOUR = 3;
const END_MINUTE = 30;

// ===============================
// CONFIG SÉCURITÉ
// ===============================
const SECURITY_KEY = "Launy28072011."; // 🔐 clé urgence
const EMBED_COLOR = 0x8b5cf6; // violet

let MAINTENANCE = false;
let emergencyMode = false;

// ===============================
// TEXTES
// ===============================
const MAINTENANCE_DM =
  "🚧 **Maintenance nocturne en cours** 🚧\n\n" +
  "Le serveur est **totalement inaccessible** entre **01h00 et 03h30**.\n" +
  "Aucune interaction n’est autorisée.\n\n" +
  "Merci de patienter 💜";

// ===============================
// UTILS
// ===============================
function isInMaintenanceWindow() {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const start = START_HOUR * 60 + START_MINUTE;
  const end = END_HOUR * 60 + END_MINUTE;

  return minutes >= start && minutes < end;
}

// ===============================
// ACTIONS MAINTENANCE
// ===============================
async function activateMaintenance(client) {
  if (MAINTENANCE) return;
  MAINTENANCE = true;

  client.user.setPresence({
    activities: [{
      name: "Maintenance serveur (sécurité)",
      type: ActivityType.Playing
    }],
    status: "dnd"
  });

  // Supprimer tous les liens d’invitation
  for (const guild of client.guilds.cache.values()) {
    const invites = await guild.invites.fetch().catch(() => null);
    if (!invites) continue;

    for (const invite of invites.values()) {
      await invite.delete().catch(() => {});
    }
  }

  console.log("🔒 Maintenance ACTIVÉE automatiquement");
}

async function deactivateMaintenance(client) {
  if (!MAINTENANCE) return;
  MAINTENANCE = false;

  client.user.setPresence({
    activities: [{
      name: "Serveur ouvert",
      type: ActivityType.Playing
    }],
    status: "online"
  });

  console.log("🔓 Maintenance DÉSACTIVÉE automatiquement");
}

// ===============================
// INIT
// ===============================
module.exports.init = (client) => {

  client.once("ready", () => {
    console.log("🛡️ Maintenance automatique chargée");

    // Vérification toutes les 30 secondes
    setInterval(async () => {
      if (emergencyMode) return;

      const shouldBeActive = isInMaintenanceWindow();

      if (shouldBeActive && !MAINTENANCE) {
        await activateMaintenance(client);
      }

      if (!shouldBeActive && MAINTENANCE) {
        await deactivateMaintenance(client);
      }
    }, 30 * 1000);
  });

  // =====================================================
  // 🚨 COMMANDE URGENCE (OWNER + CLÉ)
  // =====================================================
  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith("+maintenance emergency")) return;

    if (message.author.id !== message.guild.ownerId) {
      return message.reply("❌ Commande réservée au propriétaire du serveur.");
    }

    const args = message.content.split(" ");
    const action = args[2];
    const key = args[3];

    if (key !== SECURITY_KEY) {
      return message.reply("🔐 Clé de sécurité invalide.");
    }

    emergencyMode = true;

    if (action === "on") {
      await activateMaintenance(client);
      return message.reply("🚨 **Maintenance d’urgence ACTIVÉE**");
    }

    if (action === "off") {
      emergencyMode = false;
      await deactivateMaintenance(client);
      return message.reply("✅ **Maintenance d’urgence DÉSACTIVÉE**");
    }
  });

  // =====================================================
  // 💬 BLOQUER TOUS LES MESSAGES
  // =====================================================
  client.on("messageCreate", async (message) => {
    if (!MAINTENANCE) return;
    if (!message.guild || message.author.bot) return;

    await message.delete().catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle("🚧 Maintenance en cours")
      .setDescription(
        "❌ Impossible d’écrire pendant la maintenance.\n\n" +
        "🕐 **01h00 → 03h30**\n" +
        "Merci de patienter."
      )
      .setTimestamp();

    const warn = await message.channel.send({ embeds: [embed] });
    setTimeout(() => warn.delete().catch(() => {}), 10000);

    message.author.send(MAINTENANCE_DM).catch(() => {});
  });

  // =====================================================
  // 🔊 BLOQUER TOUS LES VOCAUX
  // =====================================================
  client.on("voiceStateUpdate", async (oldState, newState) => {
    if (!MAINTENANCE) return;

    if (newState.channel) {
      try {
        await newState.disconnect();
        await newState.member.send(
          "🔊 **Salon vocal fermé**\n\n" +
          "Les vocaux sont désactivés entre **01h00 et 03h30**."
        );
      } catch {}
    }
  });

  // =====================================================
  // 🚪 BLOQUER TOUS LES NOUVEAUX MEMBRES
  // =====================================================
  client.on("guildMemberAdd", async (member) => {
    if (!MAINTENANCE) return;

    try {
      await member.send(
        "🚧 **Serveur en maintenance** 🚧\n\n" +
        "Le serveur est fermé entre **01h00 et 03h30**.\n" +
        "Merci de revenir plus tard."
      );
      await member.kick("Maintenance automatique active");
    } catch {}
  });

};
