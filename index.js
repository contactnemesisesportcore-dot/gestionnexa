// ===============================
// NexaBot - INDEX.JS CLEAN (FIXED)
// ===============================

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const CONFIG = require("./config.json");

// ===============================
// CLIENT DISCORD
// ===============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

client.config = CONFIG;
client.commands = new Map();
const PREFIX = "+"; // Préfixe unique

// ===============================
// CHARGEMENT DES COMMANDES
// ===============================
const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  fs.mkdirSync(commandsPath);
  console.log("📁 Dossier commands créé.");
}

for (const file of fs.readdirSync(commandsPath)) {
  if (!file.endsWith(".js")) continue;

  try {
    const cmd = require(`./commands/${file}`);

    if (!cmd.name || typeof cmd.run !== "function") {
      console.log(`⚠ Commande ignorée (invalide) : ${file}`);
      continue;
    }

    client.commands.set(cmd.name.toLowerCase(), cmd);
    console.log(`📦 Commande chargée : +${cmd.name}`);
  } catch (err) {
    console.error(`❌ Erreur chargement commande ${file}`, err);
  }
}

// ===============================
// MESSAGECREATE → COMMANDES PREFIX
// ===============================
client.on("messageCreate", async message => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const cmdName = args.shift()?.toLowerCase();

  if (!cmdName) return;

  const cmd = client.commands.get(cmdName);

  if (!cmd) {
    return message.reply(
      `❌ Commande inconnue.\nUtilise \`${PREFIX}owner\` pour voir les commandes disponibles.`
    ).catch(() => {});
  }

  try {
    await cmd.run(client, message, args);
  } catch (err) {
    console.error("❌ Erreur commande :", err);
    message.reply("❌ Une erreur est survenue lors de l’exécution.").catch(() => {});
  }
});

// ===============================
// STATUT
// ===============================
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  const guild = client.guilds.cache.get(CONFIG.guildID);
  const memberCount = guild ? guild.memberCount : 0;

  client.user.setActivity(`NexaWin • ${memberCount} membres`, {
    type: ActivityType.Streaming,
    url: CONFIG.streamURL
  });
});

// ===============================
// KEEP ALIVE (RENDER / VPS)
// ===============================
const app = express();
app.get("/", (_, res) => res.send("NexaBot • ONLINE"));
app.listen(process.env.PORT || 3000);

// ===============================
// LOGIN
// ===============================
client.login(process.env.TOKEN);
