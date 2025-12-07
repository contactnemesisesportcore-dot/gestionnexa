// tickets-panel.js
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    try {
      const channelId = "1443299733392199871"; // salon panneau
      const channel = await client.channels.fetch(channelId);
      if (!channel) return console.log("❌ Salon des tickets introuvable.");

      const embed = new EmbedBuilder()
        .setColor("#8A2BE2")
        .setTitle("🎫 Ouvrir un ticket")
        .setDescription(
`**🎫 Avant d’ouvrir ton ticket :**
Merci de sélectionner le **motif de ta demande** afin que ton ticket soit transmis à l’équipe concernée.

**Motifs disponibles :**
🛡️ Recrutement Modération / Joueur
🎨 Candidature Studio Créatif (Graphiste, Monteur, Casteur, etc.)
🤝 Demande de Partenariat

🕓 Notre équipe analysera ta demande et te répondra dans les plus brefs délais.
Merci de rester courtois, clair et professionnel dans ta requête.`)
        .setThumbnail("https://media.discordapp.net/attachments/1431355214052589659/1442619898114211931/Capture_decran_2025-11-24_215331.png")
        .setFooter({ text: "Nexa Esport • Tickets" });

      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket_select')
          .setPlaceholder('Sélectionne le motif de ton ticket')
          .addOptions([
            { label: 'Recrutement Modération', value: 'ticket_modo', emoji: '🛡️' },
            { label: 'Recrutement Joueur', value: 'ticket_joueur', emoji: '🎮' },
            { label: 'Studio Créatif', value: 'ticket_studio', emoji: '🎨' },
            { label: 'Partenariat', value: 'ticket_part', emoji: '🤝' },
          ])
      );

      // Envoi DU PANNEAU SANS @everyone
      await channel.send({ embeds: [embed], components: [menu] });
      console.log("📨 Panneau de tickets envoyé (sans mention everyone).");
    } catch (err) {
      console.error("Erreur tickets-panel:", err);
    }
  }
};
