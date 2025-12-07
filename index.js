// Modules
const fs = require("fs");
const express = require("express");
const { Client, GatewayIntentBits, Partials, Collection, ActivityType } = require("discord.js");
require("dotenv").config();

// --- CLIENT DISCORD ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

// --- COLLECTIONS POUR LES EVENTS ---
client.events = new Collection();

// --- CHARGEMENT DES EVENTS ---
const eventsFolder = __dirname;
const eventFiles = fs.readdirSync(eventsFolder).filter(file => file.endsWith(".js") && file !== "index.js");

for (const file of eventFiles) {
    const event = require(`./${file}`);
    if (event.name && typeof event.execute === "function") {
        client.on(event.name, (...args) => event.execute(...args, client));
        console.log(`✔ Event chargé : ${file}`);
    }
}

// --- STATUS DU BOT ---
client.once('ready', () => {
    console.log(`Bot connecté en tant que ${client.user.tag}`);
    setInterval(() => {
        const guild = client.guilds.cache.first();
        if (!guild) return;
        client.user.setActivity(`📺 Je stream | Surveille ${guild.memberCount} membres | Nexa Win`, { type: ActivityType.Watching });
    }, 30000);
});

// --- PING UPTIMEROBOT ---
const app = express();
app.get("/", (req, res) => res.send("Bot en ligne"));
app.listen(3000, () => console.log("Ping server ready"));

// --- LOGIN DU BOT ---
client.login(process.env.TOKEN);

module.exports = client;
