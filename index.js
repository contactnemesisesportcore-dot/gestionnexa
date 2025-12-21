// ===============================
// NexaBot - INDEX.JS CLEAN (FIX)
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
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

for (const file of fs.readdirSync(commandsPath)) {
  if (!file.endsWith(".js")) continue;

  const cmd = require(`./commands/${file}`);

  if (!cmd.name || typeof cmd.run !== "function") {
    console.log(`⚠ Commande invalide ignorée : ${file}`);
    continue;
  }

  client.commands.set(cmd.name, cmd);
  console.log(`📦 Commande chargée : +${cmd.name}`);
}

// ===============================
// CHARGEMENT DES MODULES (EVENTS)
// ===============================
const modules = ["bienvenue", "modération", "maintenance", "fun"];

for (const mod of modules) {
  const filePath = path.join(__dirname, `${mod}.js`);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ Module introuvable : ${mod}.js`);
    continue;
  }

  try {
    const moduleFile = require(filePath);
    if (typeof moduleFile.init === "function") {
      moduleFile.init(client);
      console.log(`🔧 Module chargé : ${mod}`);
    } else {
      console.log(`⚠ ${mod}.js n’a pas de init(client)`);
    }
  } catch (err) {
    console.error(`❌ Erreur module ${mod} :`, err);
  }
}

// ===============================
// MESSAGECREATE → COMMANDES PREFIX "+"
// ===============================
client.on("messageCreate", async message => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const cmdName = args.shift()?.toLowerCase();

  const cmd = client.commands.get(cmdName);
  if (!cmd) {
    return message.reply(
      `❌ Commande inconnue.\nFais \`${PREFIX}fun\` pour voir les commandes.`
    ).catch(() => {});
  }

  try {
    await cmd.run(client, message, args);
  } catch (err) {
    console.error("❌ Erreur commande :", err);
    message.reply("❌ Une erreur est survenue.").catch(() => {});
  }
});

// ===============================
// STATUT — STREAMING FIXE
// ===============================
client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  const guild = client.guilds.cache.get("1443299228020506779");
  const memberCount = guild?.memberCount || 0;

  client.user.setActivity(`NexaWin • ${memberCount} membres`, {
    type: ActivityType.Streaming,
    url: CONFIG.streamURL
  });
});

// ===============================
// RENDER KEEP-ALIVE
// ===============================
const app = express();
app.get("/", (_, res) => res.send("NexaBot • ONLINE"));
app.listen(process.env.PORT || 3000);

// ===============================
// LOGIN
// ===============================
client.login(process.env.TOKEN);
