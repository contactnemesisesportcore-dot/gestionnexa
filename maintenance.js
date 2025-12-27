// =====================================================
// 🔒 MAINTENANCE SÉCURITÉ TOTALE — OWNER ONLY
// Discord.js v14
// =====================================================

const {
  ActivityType,
  EmbedBuilder
} = require("discord.js");

let MAINTENANCE = false;

const EMBED_COLOR = 0x8b5cf6; // Violet

const MAINTENANCE_DM =
  "🚧 **Maintenance en cours** 🚧\n\n" +
  "Le serveur est actuellement **TOTALLEMENT INACCESSIBLE**.\n" +
  "Toutes les interactions sont bloquées pendant la nuit.\n\n" +
  "Merci de patienter 💜";

// ===============================
// INIT
// ===============================
module.exports.init = (client) => {

  client.once("ready", () => {
    console.log("🛡️ Maintenance sécurité (OWNER ONLY) chargée");
  });

  // =====================================================
  // 🔑 COMMANDE +maintenance (PROPRIÉTAIRE UNIQUEMENT)
  // =====================================================
  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith("+maintenance")) return;

    // 🔐 Vérification propriétaire
    if (message.author.id !== message.guild.ownerId) {
      return message.reply("❌ **Seul le propriétaire du serveur peut utiliser cette commande.**");
    }

    const args = message.content.split(" ");

    // ===============================
    // ACTIVER
    // ===============================
    if (args[1] === "on") {
      MAINTENANCE = true;

      client.user.setPresence({
        activities: [{ name: "Maintenance de sécurité", type: ActivityType.Playing }],
        status: "dnd"
      });

      // Supprimer tous les liens d’invitation
      const invites = await message.guild.invites.fetch();
      for (const invite of invites.values()) {
        await invite.delete().catch(() => {});
      }

      message.channel.send("🚧 **MAINTENANCE DE SÉCURITÉ ACTIVÉE**");
    }

    // ===============================
    // DÉSACTIVER
    // ===============================
    if (args[1] === "off") {
      MAINTENANCE = false;

      client.user.setPresence({
        activities: [{ name: "Serveur ouvert", type: ActivityType.Playing }],
        status: "online"
      });

      message.channel.send("✅ **Maintenance désactivée**");
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
        "❌ Vous ne pouvez pas écrire pendant la maintenance.\n\n" +
        "🕐 **Durée : Toute la nuit**\n" +
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
          "Les vocaux sont désactivés pendant la maintenance.\n" +
          "Merci de revenir plus tard."
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
        "Le serveur est temporairement fermé.\n" +
        "Merci de revenir après la maintenance."
      );
      await member.kick("Maintenance sécurité active");
    } catch {}
  });

};
