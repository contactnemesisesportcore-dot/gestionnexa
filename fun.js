module.exports = {
  name: "fun",
  async run(client, message, args) {
    if (!args.length) {
      return message.reply({
        embeds: [{
          title: "🎉 Commandes Fun",
          color: 0x9B59B6,
          description: `
\`+fun ping\` → Ping du bot
\`+fun avatar\` → Avatar d’un membre
\`+fun dice\` → Lance un dé
\`+fun coinflip\` → Pile ou face
\`+fun roll20\` → Lance un dé 20
\`+fun joke\` → Une blague aléatoire
\`+fun hug @user\` → Faire un câlin à quelqu'un
\`+fun slap @user\` → Gif gif gif gif gif
\`+fun 8ball <question>\` → Boule magique
\`+fun rps <pierre|papier|ciseaux>\` → Pierre Papier Ciseaux
          `
        }]
      });
    }

    const sub = args[0].toLowerCase();

    if (sub === "ping") return message.reply(`🏓 Pong ! ${client.ws.ping}ms`);

    if (sub === "avatar") {
      const user = message.mentions.users.first() || message.author;
      return message.reply(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    }

    if (sub === "dice") {
      const roll = Math.floor(Math.random() * 6) + 1;
      return message.reply(`🎲 Tu as lancé un **${roll}**`);
    }

    if (sub === "coinflip") {
      const result = Math.random() < 0.5 ? "Pile" : "Face";
      return message.reply(`🪙 Résultat : **${result}**`);
    }

    if (sub === "roll20") {
      const roll = Math.floor(Math.random() * 20) + 1;
      return message.reply(`🎲 Dé 20 : **${roll}**`);
    }

    if (sub === "joke") {
      const jokes = [
        "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau !",
        "Pourquoi les maths adorent les chats ? Parce qu’ils aiment les logiques félin-tastiques !",
        "Je suis allé à un cours de yoga, mais je me suis tordu le cerveau."
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return message.reply(joke);
    }

    if (sub === "hug") {
      const user = message.mentions.users.first();
      if (!user) return message.reply("❌ Mentionne quelqu’un à câliner !");
      return message.reply(`${message.author} fait un câlin à ${user} 🤗`);
    }

    if (sub === "slap") {
      const user = message.mentions.users.first();
      if (!user) return message.reply("❌ Mentionne quelqu’un à gifler !");
      return message.reply(`${message.author} gifle ${user} 😡`);
    }

    if (sub === "8ball") {
      const question = args.slice(1).join(" ");
      if (!question) return message.reply("❌ Pose une question !");
      const answers = ["Oui", "Non", "Peut-être", "Sans doute", "Impossible", "Demande plus tard"];
      return message.reply(`🎱 Question : ${question}\nRéponse : ${answers[Math.floor(Math.random() * answers.length)]}`);
    }

    if (sub === "rps") {
      const choices = ["pierre", "papier", "ciseaux"];
      const userChoice = args[1]?.toLowerCase();
      if (!choices.includes(userChoice)) return message.reply("❌ Choisis pierre, papier ou ciseaux !");
      const botChoice = choices[Math.floor(Math.random() * choices.length)];

      let result = "";
      if (userChoice === botChoice) result = "Égalité !";
      else if (
        (userChoice === "pierre" && botChoice === "ciseaux") ||
        (userChoice === "papier" && botChoice === "pierre") ||
        (userChoice === "ciseaux" && botChoice === "papier")
      ) result = "Tu gagnes ! 🎉";
      else result = "Tu perds ! 😢";

      return message.reply(`Tu as choisi : ${userChoice}\nBot a choisi : ${botChoice}\n**${result}**`);
    }

    return message.reply("❌ Sous-commande fun inconnue.");
  }
};
