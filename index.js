// index.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const CONFIG = require('./config.json');

// ===== Création du client Discord =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

// Données globales
client.config = CONFIG;
client.runtime = {}; 

// ===== CHARGEMENT DES MODULES =====
const modules = ['bienvenue', 'modération'];

modules.forEach(modName => {
  const file = path.join(__dirname, `${modName}.js`);

  if (!fs.existsSync(file)) {
    console.warn(`⚠ Module introuvable : ${modName}.js`);
    return;
  }

  try {
    const mod = require(file);

    if (typeof mod.init !== "function") {
      console.warn(`⚠ Le module ${modName}.js n'a pas de fonction init(client)`);
      return;
    }

    mod.init(client);
    console.log(`✅ Module chargé : ${modName}`);

  } catch (err) {
    console.error(`❌ Erreur dans ${modName}.js :`, err);
  }
});

// ====== CONFIG DU STATUT ======
const TWITCH_URL = "https://www.twitch.tv/nexacorp";
const ROTATE_INTERVAL_MS = 30000;
let i = 0;

// ====== READY EVENT ======
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  setInterval(() => {
    try {
      const guild = client.guilds.cache.first();
      const members = guild ? guild.memberCount : "0";

      const statuses = [
        `surveille ${members} membres`,
        `NexaWin — système actif`
      ];

      client.user.setActivity(statuses[i % statuses.length], {
        type: ActivityType.Streaming,
        url: TWITCH_URL
      });

      i++;

    } catch (err) {
      console.error("Erreur setActivity :", err);
    }
  }, ROTATE_INTERVAL_MS);
});

// ===== SERVEUR POUR RENDER =====
const express = require("express");
const app = express();
app.get("/", (_, res) => res.send("Bot en ligne"));
app.listen(process.env.PORT || 3000);

// ===== CONNEXION =====
if (!process.env.TOKEN) {
  console.error("❌ Le TOKEN est manquant dans .env");
  process.exit(1);
}

client.login(process.env.TOKEN);
