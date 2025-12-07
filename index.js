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

// --- CHARGEMENT DES MODULES (bienvenue.js, modération.js, etc.) ---
// Chaque module doit exporter une fonction (client) => {...}
const modules = ["bienvenue.js", "modération.js"];
modules.forEach(file => {
    try {
        require(`./${file}`)(client);
        console.log(`✔ Module chargé : ${file}`);
    } catch (error) {
        console.error(`❌ Erreur en chargeant ${file} :`, error);
    }
});

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
