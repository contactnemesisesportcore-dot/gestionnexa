module.exports = {
  name: "fun",
  aliases: ["8ball", "coinflip", "dice", "pp", "say"],
  execute(client, message, args) {

    const cmd = args.shift()?.toLowerCase();

    if (!cmd) {
      return message.reply("🎉 **Commandes fun :** 8ball, coinflip, dice, pp, say");
    }

    if (cmd === "8ball") {
      const replies = [
        "Oui", "Non", "Peut-être", "Impossible",
        "Certainement", "Jamais", "Demande plus tard"
      ];
      return message.reply(`🎱 ${replies[Math.floor(Math.random() * replies.length)]}`);
    }

    if (cmd === "coinflip") {
      return message.reply(`🪙 **${Math.random() < 0.5 ? "Pile" : "Face"}**`);
    }

    if (cmd === "dice") {
      return message.reply(`🎲 Tu as fait **${Math.floor(Math.random() * 6) + 1}**`);
    }

    if (cmd === "pp") {
      const size = Math.floor(Math.random() * 30);
      return message.reply(`🍆 PP size : ${"=".repeat(size)}`);
    }

    if (cmd === "say") {
      if (!args.length) return;
      return message.channel.send(args.join(" "));
    }
  }
};
