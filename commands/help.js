module.exports = {
  name: "help",
  description: "Aide",
  category: "system",

  async run(client, message) {
    message.reply(
      "**📘 Commandes :**\n" +
      "`+fun`\n`+stats`\n`+moderation`\n`+owner`"
    );
  }
};
