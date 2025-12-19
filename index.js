// ===============================
// NexaBot - INDEX.JS CLEAN
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

fs.readdirSync(commandsPath).forEach(file => {
  if (!file.endsWith(".js")) return;

  const cmd = require(`./commands/${file}`);

  if (!cmd.name) {
    console.log(`⚠ Commande ignorée (pas de name) : ${file}`);
    return;
  }

  client.commands.set(cmd.name, cmd);
  console.log(`📦 Commande chargée : +${cmd.name}`);
});

// ===============================
// CHARGEMENT DES MODULES
// ===============================
const modules = ["bienvenue", "modération", "modération", "tickets"];

modules.forEach(mod => {
  const filePath = path.join(__dirname, `${mod}.js`);
  if (!fs.existsSync(filePath))
    return console.log(`⚠ Module introuvable : ${mod}`);

  try {
    const moduleFile = require(filePath);
    if (typeof moduleFile.init === "function") {
      moduleFile.init(client);
      console.log(`🔧 Module chargé : ${mod}`);
    } else {
      console.log(`⚠ Le module ${mod} n’a pas d'init()`);
    }
  } catch (err) {
    console.error(`❌ Erreur module ${mod} :`, err);
  }
});

// ===============================
// MESSAGECREATE → COMMANDES PREFIX "+"
// ===============================
client.on("messageCreate", async message => {
  if (!message.guild || message.author.bot) return;

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  const cmdName = args.shift().toLowerCase();

  const cmd = client.commands.get(cmdName);
  if (!cmd) return;

  try {
    cmd.run(client, message, args);
  } catch (err) {
    console.error("❌ Erreur commande :", err);
    message.reply("❌ Une erreur est survenue.").catch(() => {});
  }
});

// ===============================
// INTERACTIONS (MENU HELP)
// ===============================
client.on("interactionCreate", async interaction => {
  if (!interaction.isStringSelectMenu()) return;
  if (interaction.customId !== "help_menu") return;

  const helpHandler = require("./helpMenuHandler.js");
  helpHandler(interaction);
});

// ===============================
// STATUT — STREAMING FIXE
// ===============================
client.once("ready", async () => {
  console.log(`✅ Connecté à ${client.user.tag}`);

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
