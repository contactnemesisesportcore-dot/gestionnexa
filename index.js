require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require("express");
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const CONFIG = require('./config.json');

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

// =====================
// CHARGEMENT MODULES
// =====================
const modules = ['bienvenue', 'modération'];

modules.forEach(name => {
  const file = path.join(__dirname, `${name}.js`);

  if (!fs.existsSync(file)) {
    console.warn(`⚠ Module introuvable : ${name}.js`);
    return;
  }

  try {
    const mod = require(file);
    if (typeof mod.init !== "function")
      return console.warn(`⚠ ${name}.js doit contenir init(client)`);

    mod.init(client);
    console.log(`✅ Module chargé : ${name}`);
  } catch (err) {
    console.error(`❌ Erreur module ${name}:`, err);
  }
});

// =====================
// STATUT STREAMING
// =====================
const ROTATE_INTERVAL = 30000;
let rotateIndex = 0;

client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  setInterval(() => {
    const guild = client.guilds.cache.first();
    const members = guild?.memberCount ?? 0;

    const statuses = [
      `surveille ${members} membres`,
      `NexaWin — système actif`
    ];

    client.user.setActivity(statuses[rotateIndex % statuses.length], {
      type: ActivityType.Streaming,
      url: CONFIG.streamURL
    });

    rotateIndex++;
  }, ROTATE_INTERVAL);
});

// =====================
// SERVEUR EXPRESS (RENDER KEEP-ALIVE)
// =====================
const app = express();
app.get("/", (_, res) => res.send("Nexa Bot — ONLINE"));
app.listen(process.env.PORT || 3000);

// =====================
// LOGIN
// =====================
client.login(process.env.TOKEN);
