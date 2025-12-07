const {
    ChannelType,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    name: "interactionCreate",
    async execute(interaction) {

        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "ticket_select") return;

        const user = interaction.user;

        // Rôles par catégorie
        const roles = {

            ticket_joueur: [
                "1443299585920598089",
                "1443299591855276062",
                "1443299593675735121",
                "1443299595114512436",
                "1443299595886006381",
                "1443299597220057259",
                "1443299598046203994",
                "1443299598973272155",
                "1443299600063533198",
                "1443299605860057208",
                "1443299619772563537",
                "1446168999279857790",
                "1443299603385421956"
            ],

            ticket_modo: [
                "1443299585920598089",
                "1443299591855276062",
                "1443299593675735121",
                "1443299595114512436",
                "1443299595886006381",
                "1443299597220057259",
                "1443299598046203994",
                "1443299598973272155",
                "1443299600063533198",
                "1443299605860057208"
            ],

            ticket_studio: [
                "1443299585920598089",
                "1443299591855276062",
                "1443299593675735121",
                "1443299595114512436",
                "1443299595886006381",
                "1443299597220057259",
                "1443299598046203994",
                "1443299598973272155",
                "1443299600063533198",
                "1443299605860057208",
                "1443299607957475360"
            ],

            ticket_part: [
                "1443299585920598089",
                "1443299591855276062",
                "1443299593675735121",
                "1443299595114512436",
                "1443299595886006381",
                "1443299597220057259",
                "1443299598046203994",
                "1443299598973272155",
                "1443299600063533198",
                "1443299605860057208",
                "1443299607957475360",
                "1443299611987939570"
            ]
        };

        const type = interaction.values[0];
        const staffRoles = roles[type];

        // NOM DU SALON SELON LA CATÉGORIE
        const names = {
            ticket_modo: "ticket-modération",
            ticket_joueur: "ticket-joueur",
            ticket_studio: "ticket-studio",
            ticket_part: "ticket-part"
        };

        const channelName = `${names[type]}-${user.username}`;

        // Permissions
        const permissionOverwrites = [
            {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.EmbedLinks
                ]
            }
        ];

        // Ajouter tous les rôles autorisés
        staffRoles.forEach(id => {
            permissionOverwrites.push({
                id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            });
        });

        // Création du salon
        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites
        });

        await interaction.reply({
            content: `🎫 Ton ticket a été créé : ${ticketChannel}`,
            ephemeral: true
        });

        await ticketChannel.send(`Bienvenue ${user}, merci d'avoir ouvert un ticket.`);
    }
};
