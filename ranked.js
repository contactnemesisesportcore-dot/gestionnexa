// ===============================
// RANKED 1V1 SYSTEM (DISCORD.JS v14)
// ===============================

const fs = require("fs");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
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
  embedColor: 0x8A2BE2,
  footerIcon: "https://media.discordapp.net/attachments/1431355214052589659/1452087016966717596/L5isR1B.png",
  dataFile: "./rankedData.json"
};

// ===============================
// DATA
// ===============================
let data = fs.existsSync(CONFIG.dataFile)
  ? JSON.parse(fs.readFileSync(CONFIG.dataFile))
  : {};

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
// LEADERBOARD
// ===============================
function leaderboardEmbed() {
  const sorted = Object.values(data).sort((a, b) => b.points - a.points);

  const embed = new EmbedBuilder()
    .setTitle("🏆 Leaderboard Ranked 1v1")
    .setColor(CONFIG.embedColor)
    .setFooter({ text: "Ranked System", iconURL: CONFIG.footerIcon });

  if (sorted.length === 0) {
    embed.setDescription("Aucun joueur classé pour le moment.");
  } else {
    sorted.forEach((p, i) => {
      embed.addFields({
        name: `#${i + 1} — ${p.username}`,
        value: `✅ Victoires : ${p.wins}\n❌ Défaites : ${p.losses}\n💎 Points : ${p.points}`
      });
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
        new EmbedBuilder()
          .setTitle("ℹ️ Informations Ranked 1v1")
          .setDescription(
            "• Clique sur **1v1** pour chercher un match\n" +
            "• Salon privé créé automatiquement\n" +
            "• +10 points victoire\n" +
            "• -2 points défaite\n" +
            "• Support en cas de triche"
          )
          .setColor(CONFIG.embedColor)
          .setFooter({ text: "Ranked System", iconURL: CONFIG.footerIcon })
      ]
    });
  }

  if (match) {
    await match.bulkDelete(20).catch(() => {});
    match.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎮 Match Ranked")
          .setDescription("Clique sur le bouton pour lancer un **1v1 classé**.")
          .setColor(CONFIG.embedColor)
          .setFooter({ text: "Matchmaking", iconURL: CONFIG.footerIcon })
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ranked_1v1")
            .setLabel("⚔️ 1v1")
            .setStyle(ButtonStyle.Primary)
        )
      ]
    });
  }

  if (support) {
    await support.bulkDelete(20).catch(() => {});
    support.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🎫 Support Ranked")
          .setDescription("Clique ci-dessous pour ouvrir un **ticket support**.")
          .setColor(CONFIG.embedColor)
          .setFooter({ text: "Support Ranked", iconURL: CONFIG.footerIcon })
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ranked_support")
            .setLabel("Ouvrir un ticket")
            .setStyle(ButtonStyle.Secondary)
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

        const channel = await guild.channels.create({
          name: `match-${interaction.user.username}-vs-${opponent.username}`,
          type: ChannelType.GuildText,
          parent: CONFIG.categoryRanked,
          permissionOverwrites: [
            { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: opponent.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            { id: CONFIG.supportRole, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
          ]
        });

        channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("⚔️ Match 1v1")
              .setDescription(`${interaction.user} VS ${opponent.username}`)
              .setColor(CONFIG.embedColor)
              .setFooter({ text: "Ranked Match", iconURL: CONFIG.footerIcon })
          ]
        });

        return interaction.reply({ content: `✅ Match créé : ${channel}`, ephemeral: true });
      }

      waiting.set(interaction.user.id, interaction.user);
      interaction.reply({ content: "⏳ En attente d’un adversaire...", ephemeral: true });
    }

    // SUPPORT
    if (interaction.customId === "ranked_support") {
      const channel = await guild.channels.create({
        name: `support-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CONFIG.categoryRanked,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: CONFIG.supportRole, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
        ]
      });

      channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎫 Ticket Support")
            .setDescription("Explique ton problème ici.")
            .setColor(CONFIG.embedColor)
            .setFooter({ text: "Support Ranked", iconURL: CONFIG.footerIcon })
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
      await lb.bulkDelete(20).catch(() => {});
      lb.send({ embeds: [leaderboardEmbed()] });
    }

    if (cmd === "+leaderboard") {
      message.channel.send({ embeds: [leaderboardEmbed()] });
    }
  });
};
