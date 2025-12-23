const { 
    ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    StringSelectMenuBuilder, PermissionsBitField, 
    EmbedBuilder, ChannelType 
} = require('discord.js');

// Rôles
const roles = {
    femme: '1443299668699386068',
    homme: '1443299667965120684',
    annonces: '1443299669923856425',
    tournois: '1443299671979331636',
    reseaux: '1443299671148597412',
    membres: '1443299666765807647',
    poleAutres: '1443299656208748737',
    poleRoles: '1452355644236632126',
    regleAccepte: '1446169069119340685'
};

// Règlement complet
const reglementTexte = `
**Règlement et Conditions d’Utilisation – Serveur Discord**

1. Introduction
Bienvenue sur le serveur Discord Nexa. En rejoignant ce serveur, vous acceptez pleinement le présent règlement ainsi que les Conditions Générales d’Utilisation (TOS). Le non-respect de ces règles peut entraîner des sanctions allant de l’avertissement à l’exclusion définitive du serveur, sans préavis.

2. Respect et comportement
- Respect mutuel obligatoire
  - Aucun propos discriminatoire, raciste, sexiste, homophobe, transphobe, ou incitant à la haine ne sera toléré.
  - Les attaques personnelles, harcèlement, intimidation ou trolling excessif sont interdits.
- Langage et contenu
  - Le langage vulgaire est toléré dans une limite raisonnable et non dirigé contre un membre ou un groupe.
  - Les contenus choquants, violents, pornographiques ou illégaux sont strictement interdits.
- Spam et publicité
  - Le spam, les messages répétitifs ou non sollicités sont interdits.
  - La publicité pour d’autres serveurs Discord, produits, services ou liens commerciaux nécessite une autorisation préalable des modérateurs.

3. Sécurité et vie privée
- Données personnelles
  - Ne partagez jamais d’informations personnelles vous concernant ou concernant d’autres personnes.
  - Le partage d’informations privées ou confidentielles est strictement interdit.
- Comptes et accès
  - Chaque utilisateur doit utiliser un compte Discord unique et réel.
  - Le piratage, le vol de compte ou l’usurpation d’identité est interdit et pourra être signalé aux autorités compétentes.

4. Contenu et propriété intellectuelle
- Respect des droits d’auteur
  - Toute publication (images, vidéos, musique, textes, code) doit respecter le droit d’auteur.
  - Le plagiat ou l’utilisation non autorisée de contenus tiers peut entraîner la suppression immédiate du contenu et des sanctions.
- Créations internes
  - Les contenus créés et publiés sur le serveur peuvent être utilisés par l’équipe pour des événements, archives ou publications internes, sauf mention contraire de l’auteur.

5. Règles de salon et communication
- Canaux textuels et vocaux
  - Respectez la thématique de chaque canal.
  - Les discussions hors-sujet doivent se limiter aux salons appropriés.
- Bots et automatisation
  - L’utilisation de bots personnels ou scripts automatisés sans autorisation est interdite.

6. Sanctions et modération
- Système de sanctions
  - Avertissement verbal → Avertissement écrit → Suspension temporaire → Expulsion définitive.
  - Les modérateurs appliquent les sanctions à leur discrétion selon la gravité des infractions.
- Contestation
  - Toute contestation doit être adressée à l’équipe de modération via message privé.
  - Les décisions de l’équipe sont finales et non négociables sur le serveur public.

7. Conditions d’utilisation et TOS
- En utilisant ce serveur, vous acceptez :
  - Respect de Discord TOS : https://discord.com/terms
  - Responsabilité individuelle : vous assumez l’entière responsabilité de vos actions sur le serveur.
  - Modifications du règlement : le règlement peut être mis à jour sans préavis.
  - Usage légal : toute activité illégale est strictement interdite.

8. Clause finale
En restant membre du serveur Nexa, vous déclarez avoir lu, compris et accepté toutes les conditions présentées dans ce règlement et les TOS. Le non-respect de ces règles entraîne automatiquement l’application des sanctions prévues.
`;

const userStates = new Map();

module.exports = {
    init(client) {
        client.on('guildMemberAdd', async (member) => {
            this.handleNewMember(member);
        });

        client.on('interactionCreate', async (interaction) => {
            this.handleInteraction(interaction);
        });
    },

    async handleNewMember(member) {
        const guild = member.guild;

        const channel = await guild.channels.create({
            name: `👋-accueil-${member.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                { id: member.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] }
            ]
        }).catch(console.error);

        if (!channel) return;

        userStates.set(member.id, { step: 0, channelId: channel.id });

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#8A2BE2') // violet
            .setTitle('🎉 Bienvenue sur Nexa Esports !')
            .setDescription(`Hello <@${member.id}> ! Bienvenue sur le serveur officiel de __Nexa Esports__.\nTu pourras discuter, jouer, participer à des événements et suivre l'actualité de l'équipe. ✨`);

        await channel.send({ embeds: [welcomeEmbed] });

        await this.sendNotificationStep(member, channel);
    },

    async sendNotificationStep(member, channel) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId('accueil_notifications')
            .setPlaceholder('📣 Choisis tes notifications (tu peux en choisir plusieurs)')
            .setMinValues(1) // obligatoire de choisir au moins 1
            .setMaxValues(3) // peut choisir jusqu’à 3
            .addOptions([
                { label: '📢 Annonces', value: 'annonces', emoji: '📢' },
                { label: '🏆 Tournois', value: 'tournois', emoji: '🏆' },
                { label: '🌐 Réseaux', value: 'reseaux', emoji: '🌐' },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);
        const embed = new EmbedBuilder()
            .setColor('#8A2BE2')
            .setTitle('📣 Notifications')
            .setDescription('Sélectionne les notifications que tu souhaites recevoir pour bien commencer ! Tu peux en choisir plusieurs. ✨');

        await channel.send({ embeds: [embed], components: [row] });
    },

    async sendGenreStep(member, channel) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId('accueil_genre')
            .setPlaceholder('👤 Quel est ton genre ?')
            .addOptions([
                { label: '👩 Femme', value: 'femme', emoji: '👩' },
                { label: '👨 Homme', value: 'homme', emoji: '👨' },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);
        const embed = new EmbedBuilder()
            .setColor('#8A2BE2')
            .setTitle('👤 Genre')
            .setDescription('Sélectionne ton genre pour personnaliser ton expérience.');

        await channel.send({ embeds: [embed], components: [row] });
    },

    async sendNexaStep(member, channel) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('accueil_nexaOui').setLabel('✅ Oui').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('accueil_nexaNon').setLabel('❌ Non').setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
            .setColor('#8A2BE2')
            .setTitle('✨ Préfixe Nexa')
            .setDescription('Veux-tu ajouter le tag Nexa devant ton pseudo ?');

        await channel.send({ embeds: [embed], components: [row] });
    },

    async sendRegleStep(member, channel) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('accueil_regleAccepte').setLabel('📜 J\'accepte le règlement').setStyle(ButtonStyle.Primary)
        );

        const embed = new EmbedBuilder()
            .setColor('#8A2BE2')
            .setTitle('📜 Règlement')
            .setDescription(reglementTexte);

        await channel.send({ embeds: [embed], components: [row] });
    },

    async handleInteraction(interaction) {
        const state = userStates.get(interaction.user.id);
        if (!state) return;
        const channel = interaction.guild.channels.cache.get(state.channelId);
        if (!channel) return;

        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'accueil_notifications' && state.step === 0) {
                for (const value of interaction.values) {
                    if (value === 'annonces') await interaction.member.roles.add(roles.annonces);
                    if (value === 'tournois') await interaction.member.roles.add(roles.tournois);
                    if (value === 'reseaux') await interaction.member.roles.add(roles.reseaux);
                }
                await interaction.reply({ content: '✅ Notifications enregistrées !', ephemeral: true });
                state.step = 1;
                await this.sendGenreStep(interaction.member, channel);
            } else if (interaction.customId === 'accueil_genre' && state.step === 1) {
                if (interaction.values[0] === 'femme') await interaction.member.roles.add(roles.femme);
                if (interaction.values[0] === 'homme') await interaction.member.roles.add(roles.homme);
                await interaction.reply({ content: '✅ Genre enregistré !', ephemeral: true });
                state.step = 2;
                await this.sendNexaStep(interaction.member, channel);
            } else {
                await interaction.reply({ content: '⚠ Tu dois suivre les étapes dans l’ordre !', ephemeral: true });
            }
        }

        if (interaction.isButton()) {
            if (state.step === 2 && interaction.customId.startsWith('accueil_nexa')) {
                if (interaction.customId === 'accueil_nexaOui') {
                    await interaction.member.setNickname(`Nexa ${interaction.member.user.username}`).catch(() => {});
                    await interaction.reply({ content: '✅ Ton pseudo a été modifié avec Nexa !', ephemeral: true });
                } else {
                    await interaction.reply({ content: '❌ Aucun changement de pseudo effectué.', ephemeral: true });
                }
                state.step = 3;
                await this.sendRegleStep(interaction.member, channel);
            } else if (state.step === 3 && interaction.customId === 'accueil_regleAccepte') {
                await interaction.member.roles.add(roles.regleAccepte);
                await interaction.reply({ content: '🎉 Merci d’avoir accepté le règlement ! Le salon sera supprimé.', ephemeral: true });
                setTimeout(async () => {
                    await channel.delete().catch(console.error);
                    userStates.delete(interaction.user.id);
                }, 5000);
            } else {
                await interaction.reply({ content: '⚠ Tu dois suivre les étapes dans l’ordre !', ephemeral: true });
            }
        }
    }
};
