const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",

  async run(client, message, args) {
    const category = args[0];

    const embed = new EmbedBuilder()
      .setColor("#7b2cff")
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({ text: `Préfixe : +` })
      .setTimestamp();

    // =========================
    // MENU PRINCIPAL
    // =========================
    if (!category) {
      embed
        .setTitle("📘 Menu d’aide — NexaBot")
        .setDescription(
          "**Catégories disponibles :**\n\n" +
          "`+help fun` 🎉\n" +
          "`+help stats` 📊\n" +
          "`+help modération` 🛡️\n" +
          "`+help owner` 👑\n\n" +
          "👉 Utilise `+help <catégorie>`"
        );

      return message.reply({ embeds: [embed] });
    }

    // =========================
    // FUN
    // =========================
    if (category === "fun") {
      embed
        .setTitle("🎉 Commandes Fun")
        .setDescription(
          "`+ping` → Ping du bot\n" +
          "`+avatar [@user]` → Avatar\n" +
          "`+say <texte>` → Le bot parle\n" +
          "`+roll` → Nombre aléatoire\n" +
          "`+8ball <question>` → Boule magique\n" +
          "`+hug @user`\n" +
          "`+slap @user`\n" +
          "`+coinflip`\n"
        );

      return message.reply({ embeds: [embed] });
    }

    // =========================
    // STATS
    // =========================
    if (category === "stats") {
      embed
        .setTitle("📊 Commandes Stats")
        .setDescription(
          "`+stats` → Menu stats\n" +
          "`+stats server`\n" +
          "`+stats user [@user]`\n" +
          "`+stats bot`\n" +
          "`+stats roles`\n" +
          "`+stats channels`\n" +
          "`+stats voice`\n" +
          "`+stats boosts`\n" +
          "`+stats emojis`\n" +
          "`+stats created`\n" +
          "`+stats owner`\n" +
          "`+stats online`\n"
        );

      return message.reply({ embeds: [embed] });
    }

    // =========================
    // MODÉRATION
    // =========================
    if (category === "modération" || category === "moderation") {
      embed
        .setTitle("🛡️ Commandes Modération")
        .setDescription(
          "`+clear <nombre>` → Supprimer messages\n" +
          "`+warn @user <raison>`\n" +
          "`+warns @user`\n" +
          "`+unwarn @user`\n" +
          "`+mute @user <temps>`\n" +
          "`+unmute @user`\n" +
          "`+kick @user <raison>`\n" +
          "`+ban @user <raison>`\n" +
          "`+unban <id>`\n"
        );

      return message.reply({ embeds: [embed] });
    }

    // =========================
    // OWNER
    // =========================
    if (category === "owner") {
      // sécurité : owner only
      if (message.author.id !== message.guild.ownerId) {
        return message.reply("❌ Cette catégorie est réservée au propriétaire du serveur.");
      }

      embed
        .setTitle("👑 Commandes Owner")
        .setDescription(
          "`+maintenance on/off`\n" +
          "`+setstatus <texte>`\n" +
          "`+setactivity <texte>`\n" +
          "`+reload`\n" +
          "`+shutdown`\n" +
          "`+eval <code>`\n" +
          "`+sayowner <texte>`\n"
        );

      return message.reply({ embeds: [embed] });
    }

    // =========================
    // ERREUR
    // =========================
    return message.reply("❌ Catégorie inconnue. Fais `+help`.");
  }
};
