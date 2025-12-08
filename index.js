// index.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const CONFIG = require('./config.json'); // IDs / salons / logs / image

// →→→ AJOUT IMPORTANT : ID de TON SERVEUR (pour éviter le bug "2 membres")
const GUILD_ID = CONFIG.guildId; // Mets ton ID dans config.json

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
client.runtime = {};

// -------------------------
// 🧩 CHARGEMENT MODULES
// -------------------------
const modules = ['welcome', 'moderation'];
modules.forEach(name => {
  const p1 = path.join(__dirname, `${name}.js`);
  const p2 = path.join(__dirname, 'moderation', `${name}.js`);
  let modPath = null;

  if (fs.existsSync(p1)) modPath = p1;
  else if (fs.existsSync(p2)) modPath = p2;

  if (!modPath) {
    console.warn(`Module ${name} introuvable.`);
    return;
  }

  try {
    const mod = require(modPath);
    if (mod && typeof mod.init === 'function') mod.init(client);
    console.log(`Module chargé: ${name}`);
  } catch (err) {
    console.error(`Erreur chargement module ${name}:`, err);
  }
});

// -------------------------
// 🎥 STATUT STREAMING FIXÉ
// -------------------------
const TWITCH_URL = 'https://www.twitch.tv/nexacorp';
const ROTATE_INTERVAL_MS = 30000;

client.once('ready', async () => {
  console.log(`🔥 Connecté en tant que ${client.user.tag}`);

  let idx = 0;

  setInterval(async () => {
    try {
      // →→→ FIX : on prend toujours TON serveur, pas un serveur random
      const guild = client.guilds.cache.get(GUILD_ID);

      const members = guild ? guild.memberCount : "???";

      const statuses = [
        `Surveille ${members} membres`,
        `NexaWin`
      ];

      const statusText = statuses[idx % statuses.length];

      await client.user.setActivity(statusText, {
        type: ActivityType.Streaming,
        url: TWITCH_URL
      });

      idx++;
    } catch (err) {
      console.error("Erreur statut:", err);
    }
  }, ROTATE_INTERVAL_MS);
});

// -------------------------
// 🌐 Serveur ping UptimeRobot
// -------------------------
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot Nexa en ligne'));
app.listen(process.env.PORT || 3000, () => console.log('Ping server ready'));

// -------------------------
// 🔐 TOKEN
// -------------------------
if (!process.env.TOKEN) {
  console.error("ERREUR: TOKEN manquant.");
  process.exit(1);
}

client.login(process.env.TOKEN).catch(err => {
  console.error("Erreur login:", err);
  process.exit(1);
});
