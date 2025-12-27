// ===============================
// MAINTENANCE SÉCURITÉ TOTALE
// Discord.js v14
// ===============================

const { ActivityType } = require("discord.js");

let maintenance = false;

module.exports.init = (client) => {

  // ===============================
  // READY
  // ===============================
  client.once("ready", () => {
    console.log("🛡️ Maintenance sécurité prête");
  });

  // ===============================
  // COMMANDE MAINTENANCE
  // ===============================
  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    const args = message.content.split(" ");
    if (args[0] !== "+maintenance") return;

    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ Permission refusée.");
    }

    // ACTIVER
    if (args[1] === "on") {
      maintenance = true;

      // Statut bot
      client.user.setPresence({
        activities: [{ name: "Maintenance de sécurité", type: ActivityType.Playing }],
        status: "dnd"
      });

      // Supprime tous les liens d’invitation
      const invites = await message.guild.invites.fetch();
      for (const invite of invites.values()) {
        await invite.delete().catch(() => {});
      }

      message.channel.send("🚧 **MAINTENANCE DE SÉCURITÉ ACTIVÉE**");
    }

    // DÉSACTIVER
    if (args[1] === "off") {
      maintenance = false;

      client.user.setPresence({
        activities: [{ name: "Serveur ouvert", type: ActivityType.Playing }],
        status: "online"
      });

      message.channel.send("✅ **Maintenance désactivée**");
    }
  });

  // ===============================
  // BLOQUER MESSAGES
  // ===============================
  client.on("messageCreate", async (message) => {
    if (!maintenance) return;
    if (!message.guild) return;
    if (message.author.bot) return;

    try {
      await message.delete();
      await message.author.send(
        "🚧 **Maintenance en cours** 🚧\n\n" +
        "Le serveur est temporairement inaccessible.\n" +
        "Merci de revenir plus tard."
      ).catch(() => {});
    } catch {}
  });

  // ===============================
  // BLOQUER VOCAUX
  // ===============================
  client.on("voiceStateUpdate", async (oldState, newState) => {
    if (!maintenance) return;

    // Si l'utilisateur rejoint un vocal
    if (!oldState.channel && newState.channel) {
      try {
        await newState.disconnect();
        await newState.member.send(
          "🚧 **Maintenance en cours** 🚧\n\n" +
          "Les salons vocaux sont désactivés temporairement."
        ).catch(() => {});
      } catch {}
    }
  });

  // ===============================
  // BLOQUER NOUVEAUX MEMBRES
  // ===============================
  client.on("guildMemberAdd", async (member) => {
    if (!maintenance) return;

    try {
      await member.send(
        "🚧 **Maintenance de sécurité** 🚧\n\n" +
        "Le serveur est actuellement fermé.\n" +
        "Merci de revenir plus tard."
      );
      await member.kick("Maintenance serveur");
    } catch {}
  });

};
