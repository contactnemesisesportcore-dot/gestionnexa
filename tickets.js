const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const cooldowns = new Map();
let ticketCounter = 0;

// Fonction pour récupérer le formulaire correspondant au type de ticket
function getFormulaire(type) {
  const forms = {
    moderation: {
      title: "🛡️ Formulaire — Recrutement Modération",
      content: `
**Nom ou Pseudo :**  
**Âge :**  
**Pays / Fuseau horaire :**  
**Discord :**  
**Disponibilités :**  

🎯 **Expérience & Compétences**  
- As-tu déjà été staff ? Oui / Non  
- Si oui, où et quel rôle ?  
- Bots maîtrisés ?  

🧠 **Gestion**  
- Comment gères-tu un conflit ?  
- Réaction face à un membre irrespectueux ?  

💡 **Motivation**  
- Pourquoi ce poste ?  
- Qualités principales ?  
- Défauts ?  
- Vision d’un bon modérateur ?  

🎧 Micro : Oui / Non
`
    },

    joueur: {
      title: "🎮 Formulaire — Recrutement Joueur",
      content: `
**Pseudo Epic Games :**  
**Pseudo Discord :**  
**PR EU actuel :**  

📸 **Capture du PR EU**  

🗣️ **Présentation**  
- Rôle / Style de jeu :  
- Objectifs :  
- Forces :  
- Axes d’amélioration :
`
    },

    studio: {
      title: "🎨 Formulaire — Studio Créatif",
      content: `
**Nom / Pseudo :**  
**Discord :**  
**Âge :**  
**Pays / Fuseau horaire :**  
🎧 Micro : Oui / Non  

🧠 Expérience :  
📦 Disponibilité :  
☐ Temps plein ☐ Temps partiel ☐ Projet ponctuel  

💰 Collaboration :  
☐ Bénévolat ☐ Freelance ☐ Stage  

🔗 Portfolio / Liens :  

🤝 Travail en équipe : Oui / Non
`
    },

    partenariat: {
      title: "🤝 Formulaire — Partenariat",
      content: `
**Nom de la structure :**  
**Contact :**  
**Discord :**  
**Email :**  
**Pays :**  

🎯 Type de partenariat :  
☐ Visibilité ☐ Média ☐ Sponsoring  

📈 Audience / Statistiques :  
💰 Budget (si sponsoring) :
`
    },

    aide: {
      title: "🆘 Formulaire — Aide",
      content: `
Explique clairement ton problème :  

- Problème rencontré :  
- Depuis quand ?  
- Capture ou détail utile :
`
    }
  };

  return forms[type];
}

module.exports.init = client => {
  const config = client.config.ticketSystem;

  /* ===============================
     PANNEAU DE CRÉATION DE TICKET
  =============================== */
  client.once("ready", async () => {
    const channel = await client.channels.fetch("1443299733392199871").catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(config.ticketColor)
      .setTitle("🎫 Ouvrir un ticket")
      .setDescription(
        "🎫 **Avant d’ouvrir ton ticket :**\n" +
        "Merci de sélectionner le motif de ta demande.\n\n" +
        "🛡️ Recrutement Modération / Joueur\n" +
        "🎨 Candidature Studio Créatif\n" +
        "🤝 Demande de Partenariat\n" +
        "🆘 Aide\n\n" +
        "Merci de rester courtois et professionnel."
      )
      .setImage(config.ticketImage);

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_select")
      .setPlaceholder("Sélectionne le type de ticket")
      .addOptions([
        { label: "Aide", value: "aide", emoji: "🆘" },
        { label: "Recrutement Joueur", value: "joueur", emoji: "🎮" },
        { label: "Recrutement Modération", value: "moderation", emoji: "🛡️" },
        { label: "Studio Créatif", value: "studio", emoji: "🎨" },
        { label: "Partenariat", value: "partenariat", emoji: "🤝" }
      ]);

    await channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  });

  /* ===============================
     CRÉATION DU TICKET
  =============================== */
  client.on("interactionCreate", async interaction => {
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
      const userId = interaction.user.id;
      const now = Date.now();

      const data = cooldowns.get(userId) || [];
      const recent = data.filter(t => now - t < 3600000);

      if (recent.length >= config.maxTicketsPerHour) {
        return interaction.reply({
          content: "❌ Tu as atteint la limite de **3 tickets par heure**. Merci de patienter.",
          ephemeral: true
        });
      }

      recent.push(now);
      cooldowns.set(userId, recent);

      const type = interaction.values[0];
      const categoryId = config.categories[type];
      ticketCounter++;

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`.toLowerCase(),
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          ...config.staffRoles.map(r => ({
            id: r,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ManageChannels
            ]
          }))
        ]
      });

      // Embed Motif
      const motifEmbed = new EmbedBuilder()
        .setColor(config.ticketColor)
        .setTitle("📌 Motif du ticket")
        .setDescription(`**Motif sélectionné :** ${type.charAt(0).toUpperCase() + type.slice(1)}`)
        .setFooter({ text: `Ticket #${ticketCounter}` });

      // Embed Formulaire spécifique
      const form = getFormulaire(type);
      const formEmbed = new EmbedBuilder()
        .setColor(config.ticketColor)
        .setTitle(form.title)
        .setDescription(form.content)
        .setFooter({ text: `Ticket #${ticketCounter}` });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("claim").setLabel("Claim").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("close").setLabel("Fermer").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("reopen").setLabel("Rouvrir").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("delete").setLabel("Supprimer").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("help").setLabel("AIDE").setStyle(ButtonStyle.Secondary)
      );

      await channel.send({
        content: `<@${interaction.user.id}> <@&${config.mentionEveryone}>`,
        embeds: [motifEmbed, formEmbed],
        components: [buttons]
      });

      await interaction.reply({ content: "✅ Ton ticket a été créé.", ephemeral: true });
      log(client, `📥 Ticket ouvert`, interaction.user, channel.name);
    }

    // ===============================
    // BOUTONS DU TICKET
    // ===============================
    if (interaction.isButton()) {
      const channel = interaction.channel;
      if (!channel.name.startsWith("ticket-")) return;

      if (interaction.customId === "help") {
        return interaction.reply({
          content:
            "📺 **Besoin d’aide pour remplir le formulaire ?**\n" +
            "➡️ PC : " + config.helpVideos.pc + "\n" +
            "➡️ Téléphone : " + config.helpVideos.mobile,
          ephemeral: true
        });
      }

      if (!interaction.member.roles.cache.some(r => config.staffRoles.includes(r.id)))
        return interaction.reply({ content: "❌ Action réservée au staff.", ephemeral: true });

      if (interaction.customId === "claim") {
        await channel.send(`📌 Ticket **claim** par ${interaction.user}`);
        log(client, "📌 Ticket claim", interaction.user, channel.name);
      }

      if (interaction.customId === "close") {
        await channel.permissionOverwrites.edit(channel.guild.id, { ViewChannel: false });
        await channel.send("🔒 Ticket fermé.");
        log(client, "🔒 Ticket fermé", interaction.user, channel.name);
      }

      if (interaction.customId === "reopen") {
        await channel.permissionOverwrites.edit(channel.guild.id, { ViewChannel: true });
        await channel.send("🔓 Ticket rouvert.");
        log(client, "🔓 Ticket rouvert", interaction.user, channel.name);
      }

      if (interaction.customId === "delete") {
        log(client, "🗑️ Ticket supprimé", interaction.user, channel.name);
        await channel.delete();
      }

      await interaction.deferUpdate();
    }
  });
};

/* ===============================
   LOGS TICKETS
=============================== */
function log(client, action, user, channel) {
  const logChannel = client.channels.cache.get(client.config.ticketSystem.logsChannel);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setColor("#8B5CF6")
    .setTitle("📑 Logs Ticket")
    .addFields(
      { name: "Action", value: action },
      { name: "Utilisateur", value: `${user.tag} (${user.id})` },
      { name: "Ticket", value: channel },
      { name: "Date", value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
    );

  logChannel.send({ embeds: [embed] });
}
