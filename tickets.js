const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionsBitField,
  ChannelType
} = require("discord.js");

module.exports = (client) => {

  const config = client.config;
  let ticketCount = 0;

  // ===============================
  // PANEL DE CRÉATION (MENU)
  // ===============================
  client.once("ready", async () => {
    const channel = await client.channels.fetch("1443299733392199871");
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#8b5cf6")
      .setThumbnail(config.ticket.thumbnail)
      .setTitle("🎫 Système de tickets")
      .setDescription(
`🎫 **Avant d’ouvrir ton ticket :**
Merci de sélectionner le motif de ta demande afin qu’elle soit transmise à l’équipe concernée.

🛡️ Recrutement Modération / Joueur  
🎨 Candidature Studio Créatif  
🤝 Demande de Partenariat  
🆘 Aide / Support

🕓 Notre équipe analysera ta demande rapidement.
Merci de rester courtois et professionnel.`
      );

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_select")
      .setPlaceholder("Sélectionne le motif de ton ticket")
      .addOptions(
        { label: "Aide", value: "aide", emoji: "🆘" },
        { label: "Recrutement Joueur", value: "joueur", emoji: "🎮" },
        { label: "Recrutement Modération", value: "moderation", emoji: "🛡️" },
        { label: "Studio Créatif", value: "studio", emoji: "🎨" },
        { label: "Partenariat", value: "partenariat", emoji: "🤝" }
      );

    await channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  });

  // ===============================
  // INTERACTIONS
  // ===============================
  client.on("interactionCreate", async interaction => {

    // ===============================
    // CRÉATION TICKET
    // ===============================
    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

      const type = interaction.values[0];
      const guild = interaction.guild;
      const user = interaction.user;
      ticketCount++;

      const categoryMap = {
        aide: "1451344734193975346",
        joueur: "1443299700777287895",
        moderation: "1443299699472728105",
        studio: "1443299702085914707",
        partenariat: "1443299704506159176"
      };

      const channel = await guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        parent: categoryMap[type],
        permissionOverwrites: [
          { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          ...config.ticket.staffRoles.map(id => ({
            id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
          }))
        ]
      });

      // ===============================
      // FORMULAIRES COMPLETS
      // ===============================
      const forms = {
        moderation: `Nom ou Pseudo :
Âge :
Pays / Fuseau horaire :
Discord :
Disponibilités (jours / heures) :

🎯 Expérience & Compétences

As-tu déjà été staff ou modérateur auparavant ?
Oui / Non
Si oui, précise où et ton rôle exact :

Quels outils ou bots de modération maîtrises-tu ?
(ex : Dyno, MEE6, Ticket Tool, Carl-bot...)

Saurais-tu gérer un conflit entre deux membres sans perdre ton calme ? Explique comment :

Comment réagirais-tu face à un membre irrespectueux envers le staff ?

💡 Profil & Motivation

Pourquoi veux-tu rejoindre le staff ?

Quelles sont tes principales qualités pour ce poste ?

As-tu des défauts qui pourraient te freiner dans ce rôle ?

Comment définirais-tu un bon modérateur ?

📎 Informations complémentaires

As-tu un micro et es-tu à l’aise à l’oral ? Oui / Non
Souhaites-tu postuler pour un autre rôle plus tard ?`,

        joueur: `Pseudo Epic Games :
Pseudo Discord :
PR EU actuel :

📸 Capture d’écran de ton PR EU :

🗣️ Présentation rapide

Rôle / Style de jeu principal :
Objectifs personnels :
Forces :
Axes d’amélioration :`,

        studio: `👤 Nom / Pseudo :
🆔 Identifiant Discord :
🗓️ Âge :
🌍 Pays & fuseau horaire :
🎧 Micro ? Oui / Non

🧠 Expérience :
📦 Disponibilité :
💰 Type de collaboration :
🔗 Liens :
💬 Motivation :`,

        partenariat: `🏢 Nom de votre projet :
📇 Personne de contact :
🆔 Discord :
📧 Email :
🌍 Pays :

🎯 Type de partenariat :
🤝 Contrepartie :
📈 Audience :
💰 Budget :
📎 Media kit :`,

        aide: `Explique clairement ton problème :
Depuis quand ?
Screenshots / vidéos si nécessaire :`
      };

      const embed = new EmbedBuilder()
        .setColor("#8b5cf6")
        .setThumbnail(config.ticket.thumbnail)
        .setTitle("📋 Formulaire")
        .setDescription(forms[type])
        .setFooter({ text: `Ticket #${ticketCount} • ${user.tag}` })
        .setTimestamp();

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("ticket_close").setLabel("Fermer").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("ticket_reopen").setLabel("Rouvrir").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("ticket_claim").setLabel("Claim").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("ticket_delete").setLabel("Supprimer").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("ticket_aide").setLabel("AIDE").setStyle(ButtonStyle.Secondary)
      );

      await channel.send({
        content: `@everyone • Ticket ouvert par <@${user.id}>`,
        embeds: [embed],
        components: [buttons]
      });

      await interaction.reply({ content: "✅ Ton ticket a été créé.", ephemeral: true });
    }
  });
};
