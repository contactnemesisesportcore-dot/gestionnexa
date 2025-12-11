// ===============================
// index.js — Nexa Bot
// ===============================
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const CONFIG = require("./config.json");

// ========== CLIENT ==========
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

// ========== CHARGEMENT MODULES ==========
const modules = ["bienvenue", "modération"];

modules.forEach(name => {
  const filepath = path.join(__dirname, `${name}.js`);

  if (!fs.existsSync(filepath)) {
    return console.warn(`⚠ Module manquant : ${name}.js`);
  }

  try {
    const mod = require(filepath);
    if (typeof mod.init !== "function")
      return console.warn(`⚠ ${name}.js doit contenir : module.exports.init = (client) => {}`);

    mod.init(client);
    console.log(`✅ Module chargé : ${name}`);
  } catch (err) {
    console.error(`❌ Erreur dans ${name}.js :`, err);
  }
});

// ========== STATUT STREAMING ==========
const ROTATE_INTERVAL = 30000;
let rotateIndex = 0;

client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  setInterval(() => {
    const guild = client.guilds.cache.get(CONFIG.guildID);
    const members = guild?.memberCount ?? 0;

    const statuses = [
      `surveille ${members} membres`,
      `NexaWin`
    ];

    client.user.setActivity(statuses[rotateIndex % statuses.length], {
      type: ActivityType.Streaming,
      url: CONFIG.streamURL
    });

    rotateIndex++;
  }, ROTATE_INTERVAL);
});

// ========== SERVEUR RENDER KEEP-ALIVE ==========
const app = express();
app.get("/", (_, res) => res.send("Nexa Bot — ONLINE"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Serveur keep-alive prêt"));

// ========== LOGIN ==========
if (!process.env.TOKEN) {
  console.error("❌ Le TOKEN est manquant dans .env");
  process.exit(1);
}

client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Erreur de connexion :", err);
  process.exit(1);
});
