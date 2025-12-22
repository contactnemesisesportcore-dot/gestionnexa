const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "fun",
  description: "Commandes fun",

  async run(client, message, args) {

    // ===============================
    // 📜 MENU FUN
    // ===============================
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor("#b65cff")
        .setTitle("🎉 Commandes FUN")
        .setDescription(
          "**Liste des commandes fun disponibles :**\n\n" +
          "`+fun ping` → Ping du bot\n" +
          "`+fun avatar [membre]` → Avatar\n" +
          "`+fun dice` → Lancer un dé\n" +
          "`+fun coinflip` → Pile ou face\n" +
          "`+fun say <texte>` → Le bot parle\n" +
          "`+fun serverinfo` → Infos serveur\n" +
          "`+fun userinfo [membre]` → Infos membre\n" +
          "`+fun hug @membre`\n" +
          "`+fun kiss @membre`\n" +
          "`+fun slap @membre`\n" +
          "`+fun rate <texte>`\n" +
          "`+fun joke`\n"
        )
        .setFooter({ text: "NexaBot • Fun Commands" });

      return message.reply({ embeds: [embed] });
    }

    const sub = args[0].toLowerCase();

    // ===============================
    // 🟣 PING
    // ===============================
    if (sub === "ping") {
      return message.reply(`🏓 **Pong !** Ping : \`${client.ws.ping}ms\``);
    }

    // ===============================
    // 🟣 AVATAR
    // ===============================
    if (sub === "avatar") {
      const member = message.mentions.users.first() || message.author;

      const embed = new EmbedBuilder()
        .setColor("#b65cff")
        .setTitle(`🖼 Avatar de ${member.username}`)
        .setImage(member.displayAvatarURL({ size: 1024, dynamic: true }));

      return message.reply({ embeds: [embed] });
    }

    // ===============================
    // 🎲 DICE
    // ===============================
    if (sub === "dice") {
      const dice = Math.floor(Math.random() * 6) + 1;
      return message.reply(`🎲 Le dé affiche : **${dice}**`);
    }

    // ===============================
    // 🪙 COINFLIP
    // ===============================
    if (sub === "coinflip") {
      const result = Math.random() < 0.5 ? "Pile" : "Face";
      return message.reply(`🪙 Résultat : **${result}**`);
    }

    // ===============================
    // 🗣 SAY
    // ===============================
    if (sub === "say") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Tu dois écrire un message.");
      return message.channel.send(text);
    }

    // ===============================
    // 🏠 SERVER INFO
    // ===============================
    if (sub === "serverinfo") {
      const embed = new EmbedBuilder()
        .setColor("#b65cff")
        .setTitle("🏠 Informations du serveur")
        .addFields(
          { name: "Nom", value: message.guild.name, inline: true },
          { name: "Membres", value: `${message.guild.memberCount}`, inline: true },
          { name: "Créé le", value: `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:F>` }
        );

      return message.reply({ embeds: [embed] });
    }

    // ===============================
    // 👤 USER INFO
    // ===============================
    if (sub === "userinfo") {
      const member = message.mentions.members.first() || message.member;

      const embed = new EmbedBuilder()
        .setColor("#b65cff")
        .setTitle(`👤 Infos de ${member.user.username}`)
        .addFields(
          { name: "ID", value: member.id },
          { name: "Compte créé", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>` },
          { name: "A rejoint", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` }
        );

      return message.reply({ embeds: [embed] });
    }

    // ===============================
    // 💞 INTERACTIONS
    // ===============================
    if (["hug", "kiss", "slap"].includes(sub)) {
      const target = message.mentions.users.first();
      if (!target) return message.reply("❌ Mentionne quelqu’un.");

      const actions = {
        hug: "🤗 fait un câlin à",
        kiss: "💋 embrasse",
        slap: "👋 gifle"
      };

      return message.reply(`${actions[sub]} **${target.username}**`);
    }

    // ===============================
    // ⭐ RATE
    // ===============================
    if (sub === "rate") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Indique quelque chose à noter.");
      const rate = Math.floor(Math.random() * 101);
      return message.reply(`⭐ **${text}** est noté **${rate}/100**`);
    }

    // ===============================
    // 😂 JOKE
    // ===============================
    if (sub === "joke") {
      const jokes = [
        "Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon ils tombent dans le bateau.",
        "Un geek ne dit pas 'j’ai froid', il dit 'ma température est négative'.",
        "Pourquoi Java et JavaScript sont-ils amis ? Ils n’ont rien en commun."
      ];
      return message.reply(`😂 ${jokes[Math.floor(Math.random() * jokes.length)]}`);
    }

    // ===============================
    // ❌ INCONNU
    // ===============================
    return message.reply("❌ Sous-commande fun inconnue. Fais `+fun`.");
  }
};
