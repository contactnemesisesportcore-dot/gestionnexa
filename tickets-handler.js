// tickets-handler.js
const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      if (!interaction.isStringSelectMenu()) return;
      if (interaction.customId !== 'ticket_select') return;

      const user = interaction.user;
      const guild = interaction.guild;
      const choice = interaction.values[0]; // ticket_modo, ticket_joueur, ticket_studio, ticket_part

      // mapping catégorie (categoryId) — parent des channels de ticket
      const parents = {
        ticket_modo: "1443299699472728105",
        ticket_joueur: "1443299700777287895",
        ticket_studio: "1443299702085914707",
        ticket_part: "1443299704506159176"
      };

      const names = {
        ticket_modo: "ticket-modération",
        ticket_joueur: "ticket-joueur",
        ticket_studio: "ticket-studio",
        ticket_part: "ticket-part"
      };

      // staffs par catégorie (IDs fournis)
      const roles = {
        ticket_joueur: [
          "1443299585920598089","1443299591855276062","1443299593675735121","1443299595114512436",
          "1443299595886006381","1443299597220057259","1443299598046203994","1443299598973272155",
          "1443299600063533198","1443299605860057208","1443299619772563537","1446168999279857790",
          "1443299603385421956"
        ],
        ticket_modo: [
          "1443299585920598089","1443299591855276062","1443299593675735121","1443299595114512436",
          "1443299595886006381","1443299597220057259","1443299598046203994","1443299598973272155",
          "1443299600063533198","1443299605860057208"
        ],
        ticket_studio: [
          "1443299585920598089","1443299591855276062","1443299593675735121","1443299595114512436",
          "1443299595886006381","1443299597220057259","1443299598046203994","1443299598973272155",
          "1443299600063533198","1443299605860057208","1443299607957475360"
        ],
        ticket_part: [
          "1443299585920598089","1443299591855276062","1443299593675735121","1443299595114512436",
          "1443299595886006381","1443299597220057259","1443299598046203994","1443299598973272155",
          "1443299600063533198","1443299605860057208","1443299607957475360","1443299611987939570"
        ]
      };

      const parentId = parents[choice];
      const baseName = names[choice];
      const channelName = `${baseName}-${user.username}`.toLowerCase().replace(/[^a-z0-9-_]/g, '-').slice(0, 90);

      // permissions -> hide for everyone, allow for user and staff roles
      const overwrites = [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks] }
      ];

      // add staff roles
      const staffRoles = roles[choice] || [];
      staffRoles.forEach(rid => {
        overwrites.push({ id: rid, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
      });

      // create channel
      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: parentId || null,
        permissionOverwrites: overwrites
      });

      // reply to user ephemeral to confirm
      await interaction.reply({ content: `🎫 Ton ticket a été créé: ${ticketChannel}`, ephemeral: true });

      // prepare embed and buttons
      const img = "https://media.discordapp.net/attachments/1431355214052589659/1442619898114211931/Capture_decran_2025-11-24_215331.png";
      const memberCount = guild.memberCount;

      const embed = new EmbedBuilder()
        .setColor("#8A2BE2")
        .setTitle("🎫 Ticket ouvert")
        .setDescription(`Bienvenue ${user} !\n\n${user} sur le serveur **Nexa Esport** ! Grâce à toi, nous sommes **${memberCount}** membres sur le serveur.\n\nVous pouvez prendre connaissance du règlement via <#1443299714744451233>.\n\nUne fois ton formulaire complété, un membre du staff reviendra vers toi.`)
        .setThumbnail(img)
        .setFooter({ text: `Ticket • ${baseName.replace('ticket_', '')}` });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('claim_ticket').setLabel('CLIM').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('remind_ticket').setLabel('RAPPEL').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('thread_ticket').setLabel('THREAD').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('close_ticket').setLabel('CLOSE').setStyle(ButtonStyle.Danger)
      );

      // send initial message IN TICKET
      // first send @everyone (in the ticket), then the embed + formulaire text
      try {
        await ticketChannel.send({ content: '@everyone' });
      } catch (err) {
        console.warn("Impossible de mentionner @everyone (permissions manquantes).");
      }

      await ticketChannel.send({ embeds: [embed] });

      // send the specific form text depending on type
      const forms = {
        ticket_modo: getModForm(),
        ticket_joueur: getJoueurForm(),
        ticket_studio: getStudioForm(),
        ticket_part: getPartForm()
      };

      const formText = forms[choice] || "Merci de décrire ta demande en détail.";

      await ticketChannel.send({ content: formText, components: [buttons] });

    } catch (err) {
      console.error("Erreur tickets-handler:", err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "Une erreur est survenue.", ephemeral: true });
      } else {
        await interaction.reply({ content: "Une erreur est survenue.", ephemeral: true });
      }
    }
  }
};

// --------- Forms (long strings) ----------
function getModForm() {
  return `**Recrutements Modération 🎫**

Nom ou Pseudo :
Âge :
Pays / Fuseau horaire :
Discord :
Disponibilités (jours / heures) :

🎯 Expérience & Compétences

As-tu déjà été staff ou modérateur auparavant ? Oui / Non
Si oui, précise où et ton rôle exact :

Quels outils ou bots de modération maîtrises-tu ? (ex : Dyno, MEE6, Ticket Tool, Carl-bot...)

Saurais-tu gérer un conflit entre deux membres sans perdre ton calme ? Explique comment :

Comment réagirais-tu face à un membre irrespectueux envers le staff ?

💡 Profil & Motivation

Pourquoi veux-tu rejoindre le staff ?

Quelles sont tes principales qualités pour ce poste ?

As-tu des défauts qui pourraient te freiner dans ce rôle ?

Comment définirais-tu un bon modérateur ?

📎 Informations complémentaires

As-tu un micro et es-tu à l’aise à l’oral ? Oui / Non
Souhaites-tu postuler pour un autre rôle plus tard (admin, manager, etc.) ? Oui / Non / Peut-être`;
}

function getJoueurForm() {
  return `**Recrutements Joueur 🎮**

Pseudo Epic Games :

Pseudo Discord :

PR EU actuel :

📸 Capture d’écran de ton PR EU :
(Ajoute ici une image claire du menu compétitif ou du tracker officiel)

🗣️ Présentation rapide

Rôle / Style de jeu principal (ex. : IGL, fragger, support)
Objectifs personnels :
Forces :
Axes d’amélioration :`;
}

function getStudioForm() {
  return `**Recrutements Studio 🎨**

Nom / Pseudo :
Identifiant Discord :
Âge :
Pays & fuseau horaire :
As-tu un micro pour les réunions vocales ? Oui / Non

Poste(s) visé(s) : (Graphiste / Monteur / Casteur / Content)
Depuis combien de temps pratiques-tu ton domaine ?
Disponibilité actuelle :
Type de collaboration souhaitée (bénévolat / freelance / rémunéré)
Liens (portfolio, chaîne, showreel) :

-- Graphiste --
Logiciels maîtrisés :
Style visuel / univers :

-- Monteur --
Logiciels utilisés :
Type de contenu monté :

-- Casteur / Commentateur --
Expérience de cast : Oui / Non
Type d’événements commentés :
Matériel (micro, setup) : Oui / Non`;
}

function getPartForm() {
  return `**Partenariats 🤝**

Nom de votre projet / structure :
Personne de contact (Nom + rôle) :
Contact Discord :
Adresse e-mail professionnelle :
Pays / Région :
Liens (site / Discord / réseaux / portfolio) :
Type de demande :
Nature de la demande :
Présentez brièvement votre structure et vos activités :
Quelle contrepartie proposez-vous ? (visibilité, contenu, etc.)
Budget / Durée souhaitée :`;
}
