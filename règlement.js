const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// ID du rôle à attribuer
const ROLE_ID = '1443299666765807647';

// ID du channel où poster le règlement
const RULES_CHANNEL_ID = '1443299714744451233';

// Vignette pour tous les embeds
const THUMBNAIL_URL = 'https://media.discordapp.net/attachments/1431355214052589659/1452087016966717596/L5isR1B.png?ex=694888eb&is=6947376b&hm=0f8015459c1fb293683e736140df079c92ca6a66028c43775c6fba926047fd93&=&format=webp&quality=lossless';

// Contenu des différents blocs du règlement
const rulesBlocks = [
    {
        title: '1. Introduction',
        description: 'Bienvenue sur le serveur Discord Nexa Esport. En rejoignant ce serveur, vous acceptez pleinement le présent règlement ainsi que les Conditions Générales d’Utilisation (TOS). Le non-respect de ces règles peut entraîner des sanctions allant de l’avertissement à l’exclusion définitive du serveur, sans préavis.'
    },
    {
        title: '2. Respect et comportement',
        description: 'Respect mutuel obligatoire\n\nAucun propos discriminatoire, raciste, sexiste, homophobe, transphobe, ou incitant à la haine ne sera toléré.\nLes attaques personnelles, harcèlement, intimidation ou trolling excessif sont interdits.\n\nLangage et contenu\nLe langage vulgaire est toléré dans une limite raisonnable et non dirigé contre un membre ou un groupe.\nLes contenus choquants, violents, pornographiques ou illégaux sont strictement interdits.\n\nSpam et publicité\nLe spam, les messages répétitifs ou non sollicités sont interdits.\nLa publicité pour d’autres serveurs Discord, produits, services ou liens commerciaux nécessite une autorisation préalable des modérateurs.'
    },
    {
        title: '3. Sécurité et vie privée',
        description: 'Données personnelles\nNe partagez jamais d’informations personnelles vous concernant ou concernant d’autres personnes.\nLe partage d’informations privées ou confidentielles est strictement interdit.\n\nComptes et accès\nChaque utilisateur doit utiliser un compte Discord unique et réel.\nLe piratage, le vol de compte ou l’usurpation d’identité est interdit et pourra être signalé aux autorités compétentes.'
    },
    {
        title: '4. Contenu et propriété intellectuelle',
        description: 'Respect des droits d’auteur\nToute publication (images, vidéos, musique, textes, code) doit respecter le droit d’auteur.\nLe plagiat ou l’utilisation non autorisée de contenus tiers peut entraîner la suppression immédiate du contenu et des sanctions.\n\nCréations internes\nLes contenus créés et publiés sur le serveur peuvent être utilisés par l’équipe pour des événements, archives ou publications internes, sauf mention contraire de l’auteur.'
    },
    {
        title: '5. Règles de salon et communication',
        description: 'Canaux textuels et vocaux\nRespectez la thématique de chaque canal.\nLes discussions hors-sujet doivent se limiter aux salons appropriés.\n\nBots et automatisation\nL’utilisation de bots personnels ou scripts automatisés sans autorisation est interdite.'
    },
    {
        title: '6. Sanctions et modération',
        description: 'Système de sanctions\nAvertissement verbal → Avertissement écrit → Suspension temporaire → Expulsion définitive.\nLes modérateurs appliquent les sanctions à leur discrétion selon la gravité des infractions.\n\nContestation\nToute contestation doit être adressée à l’équipe de modération via message privé.\nLes décisions de l’équipe sont finales et non négociables sur le serveur public.'
    },
    {
        title: '7. Conditions d’utilisation et TOS',
        description: 'En utilisant ce serveur, vous acceptez :\nRespect de Discord TOS\nVous vous engagez à respecter les Conditions d’Utilisation officielles de Discord : https://discord.com/terms\nResponsabilité individuelle\nL’équipe du serveur n’est pas responsable de vos interactions, messages privés ou contenus partagés.\nVous assumez l’entière responsabilité de vos actions sur le serveur.\nModifications du règlement\nLe présent règlement peut être mis à jour sans préavis.\nLes utilisateurs sont responsables de consulter régulièrement le règlement pour prendre connaissance des changements.\nUsage légal\nToute activité illégale (piratage, partage de contenu protégé, fraude, incitation à la violence, etc.) est strictement interdite.\nLes infractions graves pourront être signalées aux autorités compétentes.'
    },
    {
        title: '8. Clause finale',
        description: 'En restant membre du serveur Nexa Esport, vous déclarez avoir lu, compris et accepté toutes les conditions présentées dans ce règlement et les TOS. Le non-respect de ces règles entraîne automatiquement l’application des sanctions prévues.'
    }
];

// Envoi automatique du règlement dans le channel défini
client.once(Events.ClientReady, async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);

    const channel = await client.channels.fetch(RULES_CHANNEL_ID);
    if (!channel) return console.error('Channel introuvable !');

    const embeds = rulesBlocks.map(block =>
        new EmbedBuilder()
            .setTitle(block.title)
            .setDescription(block.description)
            .setColor('#7b5fc0')
            .setThumbnail(THUMBNAIL_URL)
    );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('accept_rules')
            .setLabel('Accepter le règlement')
            .setStyle(ButtonStyle.Success)
    );

    channel.send({ embeds: embeds, components: [row] });
});

// Gestion du bouton "Accepter le règlement"
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'accept_rules') {
        const member = interaction.member;

        if (member.roles.cache.has(ROLE_ID)) {
            return interaction.reply({ content: 'Vous possédez déjà le rôle, vous ne pouvez pas refaire', ephemeral: true });
        }

        try {
            await member.roles.add(ROLE_ID);
            await interaction.reply({ content: 'Rôle Membre attribué avec succès !', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors de l’attribution du rôle.', ephemeral: true });
        }
    }
});

// LOGIN avec token depuis Render / GitHub Actions
client.login(process.env.DISCORD_TOKEN);
