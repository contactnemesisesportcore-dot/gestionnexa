const { EmbedBuilder } = require("discord.js");

module.exports.init = (client) => {

  client.on("guildMemberAdd", async member => {
    try {
      // ========== RÔLE ==========
      const role = member.guild.roles.cache.get(client.config.welcomeRole);
      if (role) await member.roles.add(role).catch(() => {});

      // ========== EMBED ==========
      const embed = new EmbedBuilder()
        .setTitle("🎉 Bienvenue sur Nexa Esport !")
        .setThumbnail(client.config.welcomeImage)
        .setColor("#00A6FF")
        .setDescription(
          `👋 Bienvenue **${member}** !\n` +
          `Nous sommes désormais **${member.guild.memberCount} membres** sur le serveur.\n\n` +
          `📚 Consulte le règlement ici : <#1443299713012207748>\n` +
          `🎫 Pour créer un ticket : <#1443299733392199871>\n\n` +
          `Passe une excellente journée sur le serveur !`
        );

      const channel = member.guild.channels.cache.get(client.config.welcomeChannel);
      if (channel) channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("❌ Erreur bienvenue :", err);
    }
  });
};
