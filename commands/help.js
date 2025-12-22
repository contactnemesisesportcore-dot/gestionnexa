const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} = require("discord.js");

module.exports = {
  name: "help",
  description: "Menu d'aide du bot",

  async run(client, message) {

    // ===============================
    // EMBED PRINCIPAL
    // ===============================
    const mainEmbed = new EmbedBuilder()
      .setColor("#b65cff")
      .setTitle("📖 Menu d'aide — NexaBot")
      .setDescription(
        "Choisis une **catégorie** dans le menu ci-dessous.\n\n" +
        "⏱ Le menu se ferme automatiquement après **60 secondes** d'inactivité."
      )
      .setFooter({ text: "NexaBot • Help" });

    // ===============================
    // MENU DÉROULANT
    // ===============================
    const menu = new StringSelectMenuBuilder()
      .setCustomId("help_menu")
      .setPlaceholder("📂 Sélectionne une catégorie")
      .addOptions([
        {
          label: "🎉 Fun",
          value: "fun",
          description: "Commandes fun du bot"
        },
        {
          label: "📊 Stats",
          value: "stats",
          description: "Statistiques serveur & membres"
        },
        {
          label: "🛠 Utiles",
          value: "utils",
          description: "Commandes utiles"
        },
        {
          label: "👑 Owner",
          value: "owner",
          description: "Commandes réservées au propriétaire"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    const msg = await message.reply({
      embeds: [mainEmbed],
      components: [row]
    });

    // ===============================
    // COLLECTOR (60s)
    // ===============================
    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000
    });

    collector.on("collect", async interaction => {

      // 🔒 Seul l'auteur peut interagir
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content: "❌ Ce menu ne t'est pas destiné.",
          ephemeral: true
        });
      }

      const value = interaction.values[0];
      let embed;

      // ===============================
      // FUN
      // ===============================
      if (value === "fun") {
        embed = new EmbedBuilder()
          .setColor("#b65cff")
          .setTitle("🎉 Commandes FUN")
          .setDescription(
            "`+fun` → Menu fun\n" +
            "`+fun ping`\n" +
            "`+fun avatar`\n" +
            "`+fun dice`\n" +
            "`+fun coinflip`\n" +
            "`+fun hug`\n" +
            "`+fun kiss`\n" +
            "`+fun slap`\n" +
            "`+fun rate`\n" +
            "`+fun joke`\n"
          );
      }

      // ===============================
      // STATS
      // ===============================
      if (value === "stats") {
        embed = new EmbedBuilder()
          .setColor("#b65cff")
          .setTitle("📊 Commandes STATS")
          .setDescription(
            "`+stats server`\n" +
            "`+stats user`\n" +
            "`+stats messages`\n" +
            "`+stats vocal`\n"
          );
      }

      // ===============================
      // UTILS
      // ===============================
      if (value === "utils") {
        embed = new EmbedBuilder()
          .setColor("#b65cff")
          .setTitle("🛠 Commandes UTILES")
          .setDescription(
            "`+help`\n" +
            "`+ping`\n" +
            "`+uptime`\n" +
            "`+botinfo`\n"
          );
      }

      // ===============================
      // OWNER (PROTÉGÉ)
      // ===============================
      if (value === "owner") {

        // ❌ Si pas owner du serveur
        if (interaction.guild.ownerId !== interaction.user.id) {
          return interaction.reply({
            content: "⛔ Cette catégorie est réservée au **propriétaire du serveur**.",
            ephemeral: true
          });
        }

        embed = new EmbedBuilder()
          .setColor("#ff3c6e")
          .setTitle("👑 Commandes OWNER")
          .setDescription(
            "`+owner`\n" +
            "`+owner say`\n" +
            "`+owner status`\n" +
            "`+owner maintenance on/off`\n" +
            "`+owner restart`\n" +
            "`+owner shutdown`\n"
          );
      }

      await interaction.update({
        embeds: [embed],
        components: [row]
      });
    });

    // ===============================
    // FIN — DÉSACTIVE LE MENU
    // ===============================
    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        menu.setDisabled(true)
      );

      await msg.edit({
        components: [disabledRow]
      }).catch(() => {});
    });
  }
};
