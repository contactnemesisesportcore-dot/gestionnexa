// ===============================
// NexaBot - INDEX.JS CLEAN (FINAL)
// ===============================

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const CONFIG = require("./config.json");

// ===============================
// CLIENT
// ===============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.commands = new Map();
const PREFIX = "+";

// ===============================
// LOAD COMMANDS
// ===============================
const commandsPath = path.join(__dirname, "commands");
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

for (const file of fs.readdirSync(commandsPath)) {
  if (!file.endsWith(".js")) continue;

  const command = require(`./commands/${file}`);

  if (!command.name || typeof command.run !== "function") {
    console.log(`⚠ Commande ignorée : ${file}`);
    continue;
  }

  client.commands.set(command.name, command);
  console.log(`✅ Commande chargée : +${command.name}`);
}

// ===============================
// MESSAGE HANDLER
// ===============================
client.on("messageCreate", async message => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const cmdName = args.shift().toLowerCase();

  const command = client.commands.get(cmdName);
  if (!command) {
    return message.reply("❌ Commande inconnue.");
  }

  try {
    await command.run(client, message, args);
  } catch (err) {
    console.error(err);
    message.reply("❌ Erreur lors de l'exécution de la commande.");
  }
});

// ===============================
// READY
// ===============================
client.once("ready", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  client.user.setActivity("NexaWin", {
    type: ActivityType.Playing
  });
});

// ===============================
// KEEP ALIVE
// ===============================
const app = express();
app.get("/", (_, res) => res.send("ONLINE"));
app.listen(process.env.PORT || 3000);

// ===============================
// LOGIN
// ===============================
client.login(process.env.TOKEN);
