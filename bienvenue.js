// bienvenue.js
module.exports.init = (client) => {

  client.on("guildMemberAdd", async (member) => {
    const channelId = client.config.welcomeChannel;

    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return console.log("⚠ Salon de bienvenue introuvable.");

    channel.send({
      content: `🎉 Bienvenue ${member} sur **${member.guild.name}** !`
    });
  });

};
