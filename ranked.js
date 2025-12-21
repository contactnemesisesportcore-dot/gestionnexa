// ===============================
// RANKED 1V1 SYSTEM (FULL)
// ===============================

const fs = require("fs");
const {
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require("discord.js");

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
  categoryRanked: "1452375479796629665",
  supportRole: "1443299584737673244",
  embedColor: "#8A2BE2",
  footerIcon: "https://media.discordapp.net/attachments/1431355214052589659/1452087016966717596/L5isR1B.png",
  dataFile: "./rankedData.json"
};

// ===============================
// DATA
// ===============================
let data = {};
if (fs.existsSync(CONFIG.dataFile)) {
  data = JSON.parse(fs.readFileSync(CONFIG.dataFile));
} else {
  fs.writeFileSync(CONFIG.dataFile, JSON.stringify({}));
}

function saveData() {
  fs.writeFileSync(CONFIG.dataFile, JSON.stringify(data, null, 2));
}

function getPlayer(user) {
  if (!data[user.id]) {
    data[user.id] = {
      id: user.id,
      username: user.username,
      wins: 0,
      losses: 0,
      points: 0
    };
  }
  return data[user.id];
}

// ===============================
// LEADERBOARD EMBED
// ===============================
function leaderboardEmbed() {
  const sorted = Object.values(data).sort((a, b) => b.points - a.points);

  const embed = new MessageEmbed()
    .setTitle("🏆 Leaderboard Ranked 1v1")
    .setColor(CONFIG.embedColor)
    .setFooter({ iconURL: CONFIG.footerIcon, text: "Ranked System" });

  if (sorted.length === 0) {
    embed.setDescription("Aucun joueur classé pour le moment.");
  } else {
    sorted.forEach((p, i) => {
      embed.addField(
        `#${i + 1} — ${p.username}`,
        `✅ Victoires : ${p.wins}\n❌ Défaites : ${p.losses}\n💎 Points : ${p.points}`,
        false
      );
    });
  }
  return embed;
}

// ===============================
// SEND INITIAL EMBEDS
// ===============================
async function sendInitialEmbeds(client) {
  const info = await client.channels.fetch(CONFIG.salons.info).catch(() => null);
  const match = await client.channels.fetch(CONFIG.salons.match).catch(() => null);
  const support = await client.channels.fetch(CONFIG.salons.support).catch(() => null);

  if (info) {
    await info.bulkDelete(20).catch(() => {});
    info.send({
      embeds: [
        new MessageEmbed()
          .setTitle("ℹ️ Informations Ranked 1v1")
          .setDescription(
            "• Clique sur **1v1** pour chercher un match\n" +
            "• Salon privé créé automatiquement\n" +
            "• +10 points victoire\n" +
            "• -2 points défaite\n" +
            "• Support disponible en cas de triche"
          )
          .setColor(CONFIG.embedColor)
          .setFooter({ iconURL: CONFIG.footerIcon, text: "Ranked System" })
      ]
    });
  }

  if (match) {
    await match.bulkDelete(20).catch(() => {});
    match.send({
      embeds: [
        new MessageEmbed()
          .setTitle("🎮 Match Ranked")
          .setDescription("Clique sur le bouton pour lancer un **1v1 classé**.")
          .setColor(CONFIG.embedColor)
          .setFooter({ iconURL: CONFIG.footerIcon, text: "Matchmaking" })
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("ranked_1v1")
            .setLabel("⚔️ 1v1")
            .setStyle("PRIMARY")
        )
      ]
    });
  }

  if (support) {
    await support.bulkDelete(20).catch(() => {});
    support.send({
      embeds: [
        new MessageEmbed()
          .setTitle("🎫 Support Ranked")
          .setDescription("Clique ci-dessous pour ouvrir un **ticket support**.")
          .setColor(CONFIG.embedColor)
          .setFooter({ iconURL: CONFIG.footerIcon, text: "Support Ranked" })
      ],
      components: [
        new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("ranked_support")
            .setLabel("Ouvrir un ticket")
            .setStyle("SECONDARY")
        )
      ]
    });
  }
}

// ===============================
// INIT
// ===============================
module.exports.init = (client) => {
  const waiting = new Map();

  client.once("ready", async () => {
    console.log("✅ Ranked system prêt");
    await sendInitialEmbeds(client);
  });

  // ---------- BUTTONS ----------
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    const guild = interaction.guild;

    // 1V1
    if (interaction.customId === "ranked_1v1") {
      if (waiting.has(interaction.user.id)) {
        waiting.delete(interaction.user.id);
        return interaction.reply({ content: "❌ Recherche annulée.", ephemeral: true });
      }

      const opponent = [...waiting.values()][0];
      if (opponent) {
        waiting.delete(opponent.id);

        const channel = await guild.channels.create(
          `match-${interaction.user.username}-vs-${opponent.username}`,
          {
            type: "GUILD_TEXT",
            parent: CONFIG.categoryRanked,
            permissionOverwrites: [
              { id: guild.roles.everyone, deny: ["VIEW_CHANNEL"] },
              { id: interaction.user.id, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] },
              { id: opponent.id, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] },
              { id: CONFIG.supportRole, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] }
            ]
          }
        );

        channel.send({
          embeds: [
            new MessageEmbed()
              .setTitle("⚔️ Match 1v1")
              .setDescription(`${interaction.user} VS ${opponent.username}`)
              .setColor(CONFIG.embedColor)
              .setFooter({ iconURL: CONFIG.footerIcon, text: "Ranked Match" })
          ]
        });

        return interaction.reply({ content: `✅ Match créé : ${channel}`, ephemeral: true });
      }

      waiting.set(interaction.user.id, interaction.user);
      interaction.reply({ content: "⏳ En attente d’un adversaire...", ephemeral: true });
    }

    // SUPPORT
    if (interaction.customId === "ranked_support") {
      const channel = await guild.channels.create(
        `support-${interaction.user.username}`,
        {
          type: "GUILD_TEXT",
          parent: CONFIG.categoryRanked,
          permissionOverwrites: [
            { id: guild.roles.everyone, deny: ["VIEW_CHANNEL"] },
            { id: interaction.user.id, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] },
            { id: CONFIG.supportRole, allow: ["VIEW_CHANNEL", "SEND_MESSAGES"] }
          ]
        }
      );

      channel.send({
        embeds: [
          new MessageEmbed()
            .setTitle("🎫 Ticket Support")
            .setDescription("Explique ton problème ici.")
            .setColor(CONFIG.embedColor)
            .setFooter({ iconURL: CONFIG.footerIcon, text: "Support Ranked" })
        ]
      });

      interaction.reply({ content: `✅ Ticket créé : ${channel}`, ephemeral: true });
    }
  });

  // ---------- COMMANDS ----------
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(" ");
    const cmd = args[0].toLowerCase();
    const user = message.mentions.users.first();

    if (cmd === "+victoire" && user) {
      const p = getPlayer(user);
      p.wins++;
      p.points += 10;
      saveData();
    }

    if (cmd === "+defaite" && user) {
      const p = getPlayer(user);
      p.losses++;
      p.points = Math.max(0, p.points - 2);
      saveData();
    }

    if (["+victoire", "+defaite"].includes(cmd)) {
      const lb = await message.guild.channels.fetch(CONFIG.salons.leaderboard);
      lb.bulkDelete(20).catch(() => {});
      lb.send({ embeds: [leaderboardEmbed()] });
    }

    if (cmd === "+leaderboard") {
      message.channel.send({ embeds: [leaderboardEmbed()] });
    }
  });
};
