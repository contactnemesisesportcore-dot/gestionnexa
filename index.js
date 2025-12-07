import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import express from "express";

// --- Serveur express pour Render ---
const app = express();
app.get("/", (req, res) => res.send("Bot en ligne"));
app.listen(3000, () => console.log("Ping server ready"));

// --- Bot Discord ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // obligatoire pour lire les infos du serveur
    GatewayIntentBits.GuildMembers // obligatoire pour compter les membres
  ]
});

// Quand le bot est connecté
client.on("clientReady", async () => {
  console.log(`🔥 Connecté en tant que ${client.user.tag}`);

  // On récupère le serveur dans lequel est le bot
  const guildId = "1443299228020506779";  // <-- Mets l'ID de TON serveur

  const guild = await client.guilds.fetch(guildId);
  await guild.members.fetch(); // charge les membres

  // Compte les membres
  const memberCount = guild.memberCount;

  console.log(`👥 Membres sur le serveur : ${memberCount}`);

  // Statut streaming avec le nombre de membres
  client.user.setActivity({
    name: `👥 ${memberCount} membres`,
    type: ActivityType.Streaming,
    url: "https://twitch.tv/nexacorp" // obligatoire pour le mode streaming
  });
});

// Connexion Discord sécurisée via Render
client.login(process.env.TOKEN);
