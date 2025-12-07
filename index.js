// index.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const CONFIG = require('./config.json'); // fournis plus bas (IDs, image, thresholds)

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
client.runtime = {}; // stockage runtime (strikes, maps, etc.)

// Loader unique pour modules (welcome + moderation)
const modules = ['welcome', 'moderation']; // on charge moderation.js et welcome.js (fichiers à la racine ou dossier moderation/)
modules.forEach(name => {
  const p1 = path.join(__dirname, `${name}.js`);
  const p2 = path.join(__dirname, 'moderation', `${name}.js`);
  let modPath = null;
  if (fs.existsSync(p1)) modPath = p1;
  else if (fs.existsSync(p2)) modPath = p2;
  if (!modPath) {
    console.warn(`Module ${name} introuvable (checked ${p1} and ${p2}).`);
    return;
  }
  try {
    const mod = require(modPath);
    if (mod && typeof mod.init === 'function') mod.init(client);
    else console.warn(`Module ${name} chargé mais n'exporte pas init(client).`);
    console.log(`Module chargé: ${name} (${modPath})`);
  } catch (e) {
    console.error(`Erreur chargement module ${name}:`, e);
  }
});

// Statut rotatif : 30s Surveille X membres / 30s NexaWin streaming
const TWITCH_URL = 'https://www.twitch.tv/nexacorp';
const ROTATE_INTERVAL_MS = 30000;
client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  // initial status
  let idx = 0;
  setInterval(async () => {
    try {
      const guild = client.guilds.cache.first();
      const members = guild ? guild.memberCount : '?';
      const statuses = [
        `Surveille ${members} membres`,
        `NexaWin • regarde ${client.user.username}`,
      ];
      const s = statuses[idx % statuses.length];
      await client.user.setActivity(s, { type: ActivityType.Streaming, url: TWITCH_URL }).catch(()=>{});
      idx++;
    } catch (err) {
      console.error('Erreur rotation status:', err);
    }
  }, ROTATE_INTERVAL_MS);
});

// Ping server pour UptimeRobot
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot Nexa en ligne'));
app.listen(process.env.PORT || 3000, () => console.log('Ping server ready'));

// Vérification token
if (!process.env.TOKEN) {
  console.error('ERREUR: TOKEN manquant dans .env ou variables Render.');
  process.exit(1);
}

client.login(process.env.TOKEN).catch(err => {
  console.error('Erreur login:', err);
  process.exit(1);
});
