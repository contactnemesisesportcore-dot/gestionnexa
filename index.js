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
const PREFIX = "+"; // Préfixe officiel

// ===============================
// 🔁 CHARGEMENT RÉCURSIF DES COMMANDES
// ===============================
function loadCommands(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      loadCommands(fullPath);
      continue;
    }

    if (!file.endsWith(".js")) continue;

    const command = require(fullPath);

    if (!command.name || typeof command.run !== "function") {
      console.log(`⚠ Commande invalide ignorée : ${fullPath}`);
      continue;
    }

    client.commands.set(command.name, command);
    console.log(`📦 Commande chargée : +${command.name}`);
  }
}

const commandsPath = path.join(__dirname, "commands");
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
loadCommands(commandsPath);

// ===============================
// CHARGEMENT DES MODULES (EVENTS)
// ===============================
const modules = ["bienvenue", "modération", "maintenance", "owner", "fun", "help", "accueil"];

for (const mod of modules) {
  const filePath = path.join(__dirname, `${mod}.js`);
  if (!fs.existsSync(filePath)) continue;

  try {
    const moduleFile = require(filePath);
    if (typeof moduleFile.init === "function") {
      moduleFile.init(client);
      console.log(`🔧 Module chargé : ${mod}`);
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
  const commandName = args.shift()?.toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) {
    // Message simplifié : juste retour si commande inconnue
    return; // ❌ plus de message qui pollue
  }

  try {
    await command.run(client, message, args);
  } catch (err) {
    console.error(`❌ Erreur commande ${commandName} :`, err);
    message.reply("❌ Une erreur est survenue lors de l'exécution.").catch(() => {});
  }
});

// ===============================
// STATUT — STREAMING
// ===============================
client.once("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  const guild = client.guilds.cache.get(CONFIG.guildID);
  const memberCount = guild?.memberCount || 0;

  client.user.setActivity(`NexaWin • ${memberCount} membres`, {
    type: ActivityType.Streaming,
    url: CONFIG.streamURL
  });
});

// ===============================
// KEEP-ALIVE
// ===============================
const app = express();
app.get("/", (_, res) => res.send("NexaBot • ONLINE"));
app.listen(process.env.PORT || 3000);

// ===============================
// LOGIN
// ===============================
client.login(process.env.TOKEN);
