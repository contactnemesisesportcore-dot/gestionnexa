const fs = require("fs");
const { Client, GatewayIntentBits, Partials, Collection, ActivityType } = require("discord.js");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ],
    partials: [Partials.Channel]
});

// Charger les events (dont bienvenue.js)
client.events = new Collection();
const eventsFolder = __dirname;
const eventFiles = fs.readdirSync(eventsFolder).filter(file => file.endsWith(".js") && file !== "index.js");

for (const file of eventFiles) {
    const event = require(`./${file}`);
    if (event.name) {
        client.on(event.name, (...args) => event.execute(...args));
        console.log(`✔ Event chargé : ${file}`);
    }
}

// --- STATUS DU BOT ---
client.on('ready', () => {
    console.log(`Modération active, connecté en tant que ${client.user.tag}`);
    setInterval(async () => {
        const guild = client.guilds.cache.first();
        if (!guild) return;
        await client.user.setActivity(`📺 Je stream | Surveille ${guild.memberCount} membres | Nexa Win`, { type: 3 });
    }, 30000);
});

module.exports = client;

// Ping server pour UptimeRobot
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Bot en ligne"));
app.listen(3000, () => console.log("Ping server ready"));

// Connexion au bot
client.login(process.env.TOKEN);
