// modération.js
module.exports.init = (client) => {

  client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    const prefix = client.config.prefix;
    if (!msg.content.startsWith(prefix)) return;

    const args = msg.content.slice(prefix.length).trim().split(/\s+/);
    const cmd = args.shift().toLowerCase();

    // =============================
    //        CLEAR
    // =============================
    if (cmd === "clear") {
      if (!msg.member.permissions.has("ManageMessages"))
        return msg.reply("❌ Tu n'as pas la permission.");

      const amount = parseInt(args[0]);
      if (!amount || amount < 1 || amount > 100)
        return msg.reply("❌ Nombre entre 1 et 100.");

      await msg.channel.bulkDelete(amount, true);
      msg.channel.send(`🧹 ${amount} messages supprimés !`).then(m => setTimeout(() => m.delete(), 3000));
    }

    // =============================
    //        KICK
    // =============================
    if (cmd === "kick") {
      if (!msg.member.permissions.has("KickMembers"))
        return msg.reply("❌ Tu n'as pas la permission.");

      const user = msg.mentions.members.first();
      if (!user) return msg.reply("❌ Mentionne un membre.");

      await user.kick();
      msg.reply(`🦵 ${user.user.tag} a été expulsé.`);
    }

    // =============================
    //        BAN
    // =============================
    if (cmd === "ban") {
      if (!msg.member.permissions.has("BanMembers"))
        return msg.reply("❌ Tu n'as pas la permission.");

      const user = msg.mentions.members.first();
      if (!user) return msg.reply("❌ Mentionne un membre.");

      await user.ban();
      msg.reply(`🔨 ${user.user.tag} a été banni.`);
    }

  });

};
