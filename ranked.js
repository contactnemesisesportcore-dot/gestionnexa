// ===============================
// MODULE RANKED 1v1
// ===============================

const fs = require("fs");
const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

// ===============================
// CONFIG
// ===============================
const CONFIG = {
  salons: {
    match: "1452368911252062280",
    info: "1452368876271571110",
    leaderboard: "1452369007179993139",
    support: "1452369680361717975"
  },
  categoryRanked: "1452375479796629665", // Catégorie pour matchs et tickets
  roles: {
    support: "1443299584737673244"
  },
  embed: {
    color: "#8A2BE2", // violet
    footer: "https://media.discordapp.net/attachments/1431355214052589659/1452087016966717596/L5isR1B.png?ex=694931ab&is=6947e02b&hm=620ebf6effb75078f872515548fcebb1a3d5100b5af8e244ce8b4072ced6bbba&=&format=webp&quality=lossless"
  },
  dataFile: "./rankedData.json"
};

// ===============================
// CHARGEMENT / INIT JSON
// ===============================
let rankedData = {};
if (fs.existsSync(CONFIG.dataFile)) {
  rankedData = JSON.parse(fs.readFileSync(CONFIG.dataFile));
} else {
  fs.writeFileSync(CONFIG.dataFile, JSON.stringify({}));
}

// ===============================
// FONCTIONS UTILITAIRES
// ===============================
function saveData() {
  fs.writeFileSync(CONFIG.dataFile, JSON.stringify(rankedData, null, 2));
}

function getLeaderboardEmbed() {
  const sorted = Object.values(rankedData).sort((a, b) => b.points - a.points);
  const embed = new MessageEmbed()
    .setTitle("🏆 Leaderboard 1v1")
    .setColor(CONFIG.embed.color)
    .setFooter({ text: "Leaderboard", iconURL: CONFIG.embed.footer });

  sorted.forEach((player, i) => {
    embed.addField(
      `${i + 1}. ${player.username}`,
      `🏅 Victoires: ${player.victoires} | ❌ Défaites: ${player.defaites} | 💎 Points: ${player.points}`,
      false
    );
  });

  if (sorted.length === 0) embed.setDescription("Aucun joueur pour le moment.");
  return embed;
}

// ===============================
// EMBEDS AUTOMATIQUES
// ===============================
function sendInitialEmbeds(client) {
  const infoChannel = client.channels.cache.get(CONFIG.salons.info);
  if (infoChannel) {
    const embed = new MessageEmbed()
      .setTitle("ℹ️ Informations Ranked 1v1")
      .setDescription(
        "Bienvenue dans le système 1v1 !\n\n" +
        "- Pour créer un match : cliquez sur le bouton 1v1 dans le salon match.\n" +
        "- Les matchs se déroulent dans des salons temporaires sous la catégorie Ranked.\n" +
        "- Les scores sont ajoutés avec les commandes +victoire @joueur / +defaite @joueur.\n" +
        "- Vous pouvez ouvrir un ticket support en cas de problème ou de triche."
      )
      .setColor(CONFIG.embed.color)
      .setFooter({ text: "Informations Ranked", iconURL: CONFIG.embed.footer });
    infoChannel.send({ embeds: [embed] });
  }

  const matchChannel = client.channels.cache.get(CONFIG.salons.match);
  if (matchChannel) {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("1v1_request")
        .setLabel("1v1")
        .setStyle("PRIMARY")
    );

    const embed = new MessageEmbed()
      .setTitle("🎮 Match 1v1")
      .setDescription("Clique sur le bouton pour lancer un match 1v1 !")
      .setColor(CONFIG.embed.color)
      .setFooter({ text: "Clique pour participer", iconURL: CONFIG.embed.footer });

    matchChannel.send({ embeds: [embed], components: [row] });
  }

  const supportChannel = client.channels.cache.get(CONFIG.salons.support);
  if (supportChannel) {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("support_ticket")
        .setLabel("Support")
        .setStyle("SECONDARY")
    );

    const embed = new MessageEmbed()
      .setTitle("🎫 Support")
      .setDescription("Cliquez sur le bouton pour ouvrir un ticket support.")
      .setColor(CONFIG.embed.color)
      .setFooter({ text: "Support Ranked", iconURL: CONFIG.embed.footer });

    supportChannel.send({ embeds: [embed], components: [row] });
  }
}

// ===============================
// MODULE INIT
// ===============================
module.exports.init = (client) => {
  const activeMatches = new Map(); // joueurId => match info

  // Envoie automatiquement les embeds d'information, match et support
  sendInitialEmbeds(client);

  // Interaction button
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const { customId, user } = interaction;

    // -------------------- 1v1 --------------------
    if (customId === "1v1_request") {
      // Vérifie si le joueur est déjà dans une demande
      if (activeMatches.has(user.id)) {
        activeMatches.delete(user.id);
        return interaction.reply({ content: "✅ Vous avez annulé votre demande de match.", ephemeral: true });
      }

      // Cherche un autre joueur disponible
      const waitingPlayer = [...activeMatches.values()].find((p) => p.id !== user.id);
      if (waitingPlayer) {
        // Crée salon temporaire pour le match dans la catégorie Ranked
        const guild = interaction.guild;
        const category = guild.channels.cache.get(CONFIG.categoryRanked);
        const matchRoom = await guild.channels.create(`match-${user.username}-vs-${waitingPlayer.username}`, {
          type: "GUILD_TEXT",
          parent: category ? category.id : null,
          permissionOverwrites: [
            { id: guild.roles.everyone, deny: ["VIEW_CHANNEL"] },
            { id: user.id, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] },
            { id: waitingPlayer.id, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] },
            { id: CONFIG.roles.support, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] }
          ]
        });

        const embed = new MessageEmbed()
          .setTitle("⚔️ Match 1v1")
          .setDescription(`Joueurs : ${user.username} VS ${waitingPlayer.username}\nChoisissez vos mods et armes !`)
          .setColor(CONFIG.embed.color)
          .setFooter({ text: "Match 1v1", iconURL: CONFIG.embed.footer });

        matchRoom.send({ embeds: [embed] });

        activeMatches.delete(waitingPlayer.id);
        return interaction.reply({ content: `✅ Match créé dans ${matchRoom}`, ephemeral: true });
      }

      // Sinon, met en attente
      activeMatches.set(user.id, { id: user.id, username: user.username });
      return interaction.reply({ content: "⏳ Votre demande de 1v1 est enregistrée. Attendez un adversaire...", ephemeral: true });
    }

    // -------------------- Support Ticket --------------------
    if (customId === "support_ticket") {
      const guild = interaction.guild;
      const category = guild.channels.cache.get(CONFIG.categoryRanked);
      const ticketChannel = await guild.channels.create(`support-${interaction.user.username}`, {
        type: "GUILD_TEXT",
        parent: category ? category.id : null,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: ["VIEW_CHANNEL"] },
          { id: interaction.user.id, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] },
          { id: CONFIG.roles.support, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] }
        ]
      });

      const embed = new MessageEmbed()
        .setTitle("🎫 Ticket Support")
        .setDescription(`${interaction.user.username} a ouvert un ticket.`)
        .setColor(CONFIG.embed.color)
        .setFooter({ text: "Support", iconURL: CONFIG.embed.footer });

      ticketChannel.send({ embeds: [embed] });
      interaction.reply({ content: `✅ Ticket créé : ${ticketChannel}`, ephemeral: true });
    }
  });

  // Commandes +victoire / +défaite / +leaderboard
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    const content = message.content.trim().split(/ +/);

    const command = content[0].toLowerCase();
    const mentionUser = message.mentions.users.first();

    function ensurePlayer(user) {
      if (!rankedData[user.id]) {
        rankedData[user.id] = { id: user.id, username: user.username, victoires: 0, defaites: 0, points: 0 };
      }
      return rankedData[user.id];
    }

    // +victoire @user
    if (command === "+victoire" && mentionUser) {
      const player = ensurePlayer(mentionUser);
      player.victoires += 1;
      player.points += 10;
      saveData();

      // Update leaderboard
      const leaderboardChannel = message.guild.channels.cache.get(CONFIG.salons.leaderboard);
      if (leaderboardChannel) leaderboardChannel.send({ embeds: [getLeaderboardEmbed()] });

      return message.reply(`✅ Victoire ajoutée à ${mentionUser.username} !`);
    }

    // +defaite @user
    if (command === "+defaite" && mentionUser) {
      const player = ensurePlayer(mentionUser);
      player.defaites += 1;
      player.points = Math.max(player.points - 2, 0);
      saveData();

      // Update leaderboard
      const leaderboardChannel = message.guild.channels.cache.get(CONFIG.salons.leaderboard);
      if (leaderboardChannel) leaderboardChannel.send({ embeds: [getLeaderboardEmbed()] });

      return message.reply(`❌ Défaite ajoutée à ${mentionUser.username} !`);
    }

    // +leaderboard
    if (command === "+leaderboard") {
      const leaderboardChannel = message.guild.channels.cache.get(CONFIG.salons.leaderboard);
      if (leaderboardChannel) {
        leaderboardChannel.send({ embeds: [getLeaderboardEmbed()] });
      } else {
        message.reply({ embeds: [getLeaderboardEmbed()] });
      }
    }
  });

  console.log("🏆 Module Ranked 1v1 prêt avec tickets et embeds automatiques !");
};
