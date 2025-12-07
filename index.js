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

// Ready (statut permanent)
client.on("ready", () => {
    console.log(`🔥 Connecté en tant que ${client.user.tag}`);

    // Statut streaming + compteur membres dynamique
    setInterval(() => {
        const guild = client.guilds.cache.first();
        const memberCount = guild ? guild.memberCount : "N/A";

        client.user.setActivity(`🎮 Nexa Esport • ${memberCount} membres`, {
            type: ActivityType.Streaming,
            url: "https://twitch.tv/discord"
        });
    }, 15000); // toutes les 15 secondes
});

// Ping server pour UptimeRobot
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Bot en ligne"));
app.listen(3000, () => console.log("Ping server ready"));

// Connexion au bot
client.login(process.env.TOKEN);
