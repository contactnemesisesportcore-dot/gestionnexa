const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "stats",

  async run(client, message, args) {
    const sub = args[0];
    const guild = message.guild;

    const embed = new EmbedBuilder()
      .setColor("#7b2cff")
      .setFooter({ text: `Demandé par ${message.author.tag}` })
      .setTimestamp();

    // =====================
    // MENU STATS
    // =====================
    if (!sub) {
      embed
        .setTitle("📊 Statistiques disponibles")
        .setDescription(
          "`+stats server`\n" +
          "`+stats user @user`\n" +
          "`+stats bot`\n" +
          "`+stats roles`\n" +
          "`+stats channels`\n" +
          "`+stats voice`\n" +
          "`+stats messages`\n" +
          "`+stats boosts`\n" +
          "`+stats emojis`\n" +
          "`+stats created`\n" +
          "`+stats owner`\n" +
          "`+stats security`\n" +
          "`+stats activity`\n" +
          "`+stats online`"
        );

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // SERVER
    // =====================
    if (sub === "server") {
      embed
        .setTitle(`📊 Statistiques du serveur`)
        .addFields(
          { name: "👥 Membres", value: `${guild.memberCount}`, inline: true },
          { name: "📅 Créé le", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
          { name: "🌍 Région", value: "Auto", inline: true }
        );

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // USER
    // =====================
    if (sub === "user") {
      const member = message.mentions.members.first() || message.member;

      embed
        .setTitle(`👤 Stats de ${member.user.tag}`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "🆔 ID", value: member.id },
          { name: "📅 Compte créé", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>` },
          { name: "📥 Arrivé le", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` },
          { name: "🎭 Rôles", value: `${member.roles.cache.size - 1}` }
        );

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // BOT
    // =====================
    if (sub === "bot") {
      embed
        .setTitle("🤖 Statistiques du bot")
        .addFields(
          { name: "📡 Ping", value: `${client.ws.ping} ms`, inline: true },
          { name: "🧠 Commandes", value: `${client.commands.size}`, inline: true },
          { name: "⏱ Uptime", value: `${Math.floor(client.uptime / 60000)} minutes`, inline: true }
        );

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // ROLES
    // =====================
    if (sub === "roles") {
      embed
        .setTitle("🎭 Rôles du serveur")
        .setDescription(`Nombre total : **${guild.roles.cache.size}**`);

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // CHANNELS
    // =====================
    if (sub === "channels") {
      const text = guild.channels.cache.filter(c => c.isTextBased()).size;
      const voice = guild.channels.cache.filter(c => c.isVoiceBased()).size;

      embed
        .setTitle("📁 Salons")
        .addFields(
          { name: "💬 Textuels", value: `${text}`, inline: true },
          { name: "🔊 Vocaux", value: `${voice}`, inline: true }
        );

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // VOICE
    // =====================
    if (sub === "voice") {
      const membersInVoice = guild.members.cache.filter(m => m.voice.channel).size;

      embed
        .setTitle("🔊 Vocal")
        .setDescription(`Membres en vocal : **${membersInVoice}**`);

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // BOOSTS
    // =====================
    if (sub === "boosts") {
      embed
        .setTitle("🚀 Boosts")
        .addFields(
          { name: "Niveau", value: `${guild.premiumTier}`, inline: true },
          { name: "Boosts", value: `${guild.premiumSubscriptionCount}`, inline: true }
        );

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // EMOJIS
    // =====================
    if (sub === "emojis") {
      embed
        .setTitle("😄 Emojis")
        .setDescription(`Total : **${guild.emojis.cache.size}**`);

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // CREATED
    // =====================
    if (sub === "created") {
      embed
        .setTitle("📅 Création")
        .setDescription(`<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`);

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // OWNER
    // =====================
    if (sub === "owner") {
      const owner = await guild.fetchOwner();

      embed
        .setTitle("👑 Propriétaire")
        .setDescription(`${owner.user.tag} (${owner.id})`);

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // ONLINE
    // =====================
    if (sub === "online") {
      const online = guild.members.cache.filter(m => m.presence?.status === "online").size;

      embed
        .setTitle("🟢 Membres en ligne")
        .setDescription(`En ligne : **${online}**`);

      return message.reply({ embeds: [embed] });
    }

    // =====================
    // ERREUR
    // =====================
    return message.reply("❌ Sous-commande stats inconnue.");
  }
};
