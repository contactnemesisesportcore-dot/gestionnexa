// ===============================
// MODULE TICKETS • NEXABOT
// ===============================

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType
} = require("discord.js");

module.exports = (client) => {

  const config = client.config;

  // ===============================
  // MÉMOIRE
  // ===============================
  const ticketCooldown = new Map();
  let ticketIndex = 0;

  // ===============================
  // UTILITAIRES
  // ===============================
  const isStaff = (member) =>
    member.roles.cache.some(r => config.ticket.staffRoles.includes(r.id));

  const logTicket = async (guild, embed) => {
    const logChannel = guild.channels.cache.get(config.ticket.logs);
    if (logChannel) logChannel.send({ embeds: [embed] });
  };

  // ===============================
  // FORMULAIRES
  // ===============================
  const FORMS = {
    moderation: `**Nom / Pseudo :**
**Âge :**
**Pays / Fuseau horaire :**
**Discord :**
**Disponibilités :**

🎯 **Expérience**
As-tu déjà été staff ? Où ? Rôle ?

🛠️ Outils maîtrisés :

💡 Comment gères-tu un conflit ?

💬 Motivation :`,

    joueur: `**Pseudo Epic Games :**
**Pseudo Discord :**
**PR EU :**

📸 Capture PR :

🎮 Rôle / Style :
🎯 Objectifs :
💪 Forces :
⚠️ Axes d’amélioration :`,

    studio: `👤 Nom / Pseudo :
🆔 Discord :
🗓️ Âge :
🌍 Pays :

🎧 Micro ? Oui / Non
🧠 Expérience :
📦 Disponibilité :
💰 Collaboration :
🔗 Liens :
💬 Motivation :`,

    partenariat: `🏢 Nom de la structure :
📇 Contact :
🆔 Discord :
📧 Email :
🌍 Pays :

🎯 Type de partenariat :
🤝 Contrepartie :
📈 Audience :
💰 Budget :`,

    aide: `❓ Explique clairement ton problème :
📎 Screenshots si nécessaire :
🕒 Depuis quand ?`
  };

  // ===============================
  // INTERACTIONS
  // ===============================
  client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;

    const { guild, user, member } = interaction;

    // ===============================
    // CRÉATION TICKET
    // ===============================
    if (interaction.customId.startsWith("ticket_create_")) {

      const type = interaction.customId.split("_")[2];

      const now = Date.now();
      const history = ticketCooldown.get(user.id) || [];
      const recent = history.filter(t => now - t < 3600000);

      if (recent.length >= 3) {
        return interaction.reply({
          content: "⏳ Tu as atteint la limite de **3 tickets par heure**.",
          ephemeral: true
        });
      }

      ticketCooldown.set(user.id, [...recent, now]);
      ticketIndex++;

      const channel = await guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        parent: config.ticket.categories[type],
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          },
          ...config.ticket.staffRoles.map(r => ({
            id: r,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          }))
        ]
      });

      // ===============================
      // EMBED FORMULAIRE
      // ===============================
      const embed = new EmbedBuilder()
        .setColor("#a855f7")
        .setThumbnail(config.ticket.thumbnail)
        .setTitle(`🎫 Ticket ${type.toUpperCase()}`)
        .setDescription(FORMS[type])
        .setFooter({ text: `Ticket #${ticketIndex} • ${user.tag}` })
        .setTimestamp();

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("ticket_close").setLabel("Fermer").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("ticket_claim").setLabel("Claim").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("ticket_delete").setLabel("Supprimer").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("ticket_aide").setLabel("AIDE").setStyle(ButtonStyle.Success)
      );

      await channel.send({
        content: `@everyone | Ticket ouvert par <@${user.id}>`,
        embeds: [embed],
        components: [buttons]
      });

      await interaction.reply({ content: "✅ Ticket créé.", ephemeral: true });

      await logTicket(guild, new EmbedBuilder()
        .setColor("Green")
        .setTitle("🎫 Ticket ouvert")
        .addFields(
          { name: "Utilisateur", value: user.tag },
          { name: "Type", value: type },
          { name: "ID", value: `#${ticketIndex}` }
        )
        .setTimestamp()
      );
    }

    // ===============================
    // ACTIONS STAFF
    // ===============================
    if (!interaction.channel.name.startsWith("ticket-")) return;

    if (!isStaff(member)) {
      return interaction.reply({ content: "⛔ Action réservée au staff.", ephemeral: true });
    }

    if (interaction.customId === "ticket_close") {
      await interaction.channel.permissionOverwrites.edit(interaction.channel.topic, {
        ViewChannel: false
      });

      await interaction.reply({ content: "🔒 Ticket fermé.", ephemeral: true });
    }

    if (interaction.customId === "ticket_delete") {
      await interaction.reply({ content: "🗑️ Ticket supprimé.", ephemeral: true });
      await interaction.channel.delete();
    }

    if (interaction.customId === "ticket_claim") {
      await interaction.reply({ content: `📌 Ticket pris en charge par ${member}.` });
    }

    if (interaction.customId === "ticket_aide") {
      await interaction.reply({
        content: "🎥 Choisis ta plateforme : PC ou Téléphone",
        ephemeral: true
      });
    }
  });
};
