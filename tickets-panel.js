const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {

        // Salon où sera envoyé le sélecteur
        const channelId = "1443299733392199871";
        const channel = client.channels.cache.get(channelId);
        if (!channel) return console.log("❌ Salon des tickets introuvable.");

        // EMBED PRINCIPAL
        const embed = new EmbedBuilder()
            .setColor("#8A2BE2") // Violet
            .setTitle("🎫 Ouvrir un ticket")
            .setDescription(
                `**🎫 Avant d’ouvrir ton ticket :**\n` +
                `Merci de sélectionner le **motif de ta demande** afin que ton ticket soit transmis au bon service.\n\n` +
                `**🛡️ Recrutement Modération / Joueur**\n` +
                `**🎨 Studio Créatif (Graphiste, Monteur, Casteur, etc.)**\n` +
                `**🤝 Demande de Partenariat**\n\n` +
                `🕓 Notre équipe analysera ta demande et te répondra rapidement.\n` +
                `Merci d’être **courtois, clair et professionnel** dans ta requête.`
            )
            .setThumbnail("https://media.discordapp.net/attachments/1431355214052589659/1442619898114211931/Capture_decran_2025-11-24_215331.png") // Ton logo
            .setFooter({ text: "Service Tickets Nexa" });

        // MENU DÉROULANT
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("ticket_select")
            .setPlaceholder("Sélectionne le motif de ton ticket")
            .addOptions([
                {
                    label: "Recrutement Modération",
                    value: "ticket_modo",
                    emoji: "🛡️"
                },
                {
                    label: "Recrutement Joueur",
                    value: "ticket_joueur",
                    emoji: "🎮"
                },
                {
                    label: "Studio Créatif",
                    value: "ticket_studio",
                    emoji: "🎨"
                },
                {
                    label: "Partenariat",
                    value: "ticket_part",
                    emoji: "🤝"
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // ⚠️ Envoi du panneau avec mention everyone
        await channel.send({
            content: "@everyone",
            embeds: [embed],
            components: [row]
        });

        console.log("📨 Panneau de tickets envoyé !");
    }
};
