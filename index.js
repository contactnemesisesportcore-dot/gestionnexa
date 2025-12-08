// index.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const CONFIG = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
});

client.config = CONFIG;
client.runtime = {}; // Pour les maps runtime (spam, strikes etc.)

// =====================================================
// =========== CHARGEMENT DES MODULES CUSTOM ===========
// =====================================================

// Liste des modules à charger
const modules = [
  'bienvenue',       // fichier bienvenue.js
  'modération'       // fichier modération.js (accent inclus)
];

// Chargement sécurisé des modules
modules.forEach(name => {
  const filePath = path.join(__dirname, `${name}.js`); // ex: ./modération.js
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Module introuvable : ${filePath}`);
    return;
  }

  try {
    const mod = require(filePath);
    if (mod && typeof mod.init === 'function') {
      mod.init(client);
      console.log(`✅ Module chargé : ${name}`);
    } else {
      console.warn(`⚠️ Module ${name} ne contient pas init(client)`);
    }
  } catch (err) {
    console.error(`❌ Erreur chargement module ${name} :`, err);
  }
});

// =====================================================
// ================== ROTATION STATUS ===================
// =====================================================

const TWITCH_URL = 'https://www.twitch.tv/nexacorp';
const ROTATE_INTERVAL_MS = 30000;

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  let idx = 0;
  setInterval(async () => {
    try {
      const guild = client.guilds.cache.first();
      const members = guild ? guild.memberCount : '?';

      const statuses = [
        `Surveille ${members} membres`,
        `NexaWin`
      ];

      const status = statuses[idx % statuses.length];

      await client.user.setActivity(status, {
        type: ActivityType.Streaming,
        url: TWITCH_URL
      }).catch(() => {});

      idx++;
    } catch (err) {
      console.error('Erreur rotation status:', err);
    }
  }, ROTATE_INTERVAL_MS);
});

// =====================================================
// ================ PING SERVEUR RENDER =================
// =====================================================

const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot Nexa en ligne'));
app.listen(process.env.PORT || 3000, () => console.log('Ping server prêt'));

// =====================================================
// ===================== LOGIN BOT ======================
// =====================================================

if (!process.env.TOKEN) {
  console.error('❌ ERREUR: TOKEN manquant dans .env ou Render.');
  process.exit(1);
}

client.login(process.env.TOKEN).catch(err => {
  console.error('Erreur login:', err);
  process.exit(1);
});
