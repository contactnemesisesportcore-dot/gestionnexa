module.exports = {
  name: "owner",
  description: "Commandes owner",
  category: "owner",

  async run(client, message, args) {
    if (message.author.id !== client.config.ownerID) {
      return message.reply("❌ Owner uniquement.");
    }

    const sub = args[0];

    if (!sub) {
      return message.reply(
        "**👑 Owner :**\n" +
        "`setstatus, setactivity, reload, shutdown, eval, say`"
      );
    }

    switch (sub) {
      case "setstatus":
        client.user.setPresence({ activities: [{ name: args.slice(1).join(" ") }] });
        return message.reply("✅ Statut modifié");

      case "shutdown":
        message.reply("🛑 Arrêt...");
        process.exit();

      default:
        return message.reply("❌ Owner inconnue.");
    }
  }
};
