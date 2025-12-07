const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        
        // ID du salon de bienvenue
        const channelId = "1443299713012207748";

        // ID du rôle à ajouter
        const roleId = "1443299666765807647";

        // Ajout du rôle automatiquement
        try {
            await member.roles.add(roleId);
        } catch (err) {
            console.error("Erreur en ajoutant le rôle :", err);
        }

        // Récupérer le nombre total de membres
        const memberCount = member.guild.memberCount;

        // Channel de bienvenue
        const channel = member.guild.channels.cache.get(channelId);
        if (!channel) return console.error("Salon de bienvenue introuvable.");

        // Message de bienvenue
        const msg = 
`Bienvenue __${member}__
${member} sur le serveur **Nexa Esport** ! Grâce à toi, nous sommes **${memberCount}** membres sur le serveur.

Vous pouvez prendre connaissance du règlement :
https://discord.com/channels/1443299228020506779/1443299714744451233

Et si tu souhaites nous rejoindre ou autre, crée un ticket :
https://discord.com/channels/1443299228020506779/1443299733392199871

Cordialement <@1398784567946645545>
Passe une excellente journée sur le serveur !`;

        channel.send(msg);
    }
};
