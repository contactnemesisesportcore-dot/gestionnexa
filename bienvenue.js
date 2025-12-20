const { EmbedBuilder } = require("discord.js");

module.exports.init = (client) => {

  client.on("guildMemberAdd", async member => {
    try {
      // ===== Ajout du rôle =====
      const role = member.guild.roles.cache.get(client.config.welcomeRole);
      if (role) member.roles.add(role).catch(() => {});

      // ===== Embed =====
      const embed = new EmbedBuilder()
        .setTitle("🎉 Bienvenue sur Nexa Esport !")
        .setThumbnail(client.config.welcomeImage)
        .setColor("#00A6FF")
        .setDescription(
          `👋 Bienvenue **${member}** !\n` +
          `Nous sommes désormais **${member.guild.memberCount} membres**.\n\n` +
          `📚 Règlement : <#1443299714744451233>\n` +
          `🎫 Tickets : <#1443299733392199871>\n\n` +
          `Passe une excellente journée sur Nexa Esport !`
        );

      const channel = member.guild.channels.cache.get(client.config.welcomeChannel);
      if (channel) channel.send({ embeds: [embed] });

    } catch (err) {
      console.error("❌ Erreur bienvenue :", err);
    }
  });

};
