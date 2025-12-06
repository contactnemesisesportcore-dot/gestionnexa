import { Client, GatewayIntentBits } from "discord.js";
import express from "express";

// --- Serveur express pour Render ---
const app = express();
app.get("/", (req, res) => res.send("Bot en ligne"));
app.listen(3000, () => console.log("Ping server ready"));

// --- Bot Discord ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.on("ready", () => {
  console.log(`🔥 Connecté en tant que ${client.user.tag}`);
});

// Connexion avec la variable d'environnement
client.login(process.env.TOKEN);
