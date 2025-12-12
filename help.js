const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  name: "help",
  description: "Affiche le menu d'aide du bot",
  run: async (client, message) => {

    const embed = new EmbedBuilder()
      .setTitle("🧭 Menu d'aide – NexaBot")
      .setDescription("Sélectionne une catégorie ci-dessous pour afficher les commandes.")
      .setColor("#00A6FF")
      .setFooter({ text: "NexaBot - Help Menu" });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("help_menu")
      .setPlaceholder("Sélectionne une catégorie")
      .addOptions([
        {
          label: "🎉 Fun",
          value: "fun",
          description: "Ping, mini-jeux, fun"
        },
        {
          label: "🛡 Modération",
          value: "mod",
          description: "Ban, kick, clear, timeout, etc."
        },
        {
          label: "⚙️ Administration",
          value: "admin",
          description: "Commandes réservées au propriétaire"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await message.reply({ embeds: [embed], components: [row] });
  }
};
