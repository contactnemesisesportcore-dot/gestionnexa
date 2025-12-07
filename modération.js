const { Client, GatewayIntentBits, Partials } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
});

// --- CONFIGURATION DES SALONS DE LOG ---
const logChannels = {
    spam: '1447271744485199934',
    raid: '1447271716232368260',
    bot: '1447271871601971370',
    blacklist: '1447272108668354622'
};

// --- TRACKERS ---
const spamTracker = new Map();
const raidTracker = new Map();
const channelTracker = new Map();
const roleTracker = new Map();
const blacklist = new Set();

// --- ANTI-SPAM ---
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const now = Date.now();
    const userMessages = spamTracker.get(userId) || [];
    const updatedMessages = userMessages.filter(ts => now - ts < 10000);
    updatedMessages.push(now);
    spamTracker.set(userId, updatedMessages);

    if (updatedMessages.length >= 5) {
        await message.delete();
        const log = await client.channels.fetch(logChannels.spam);
        log.send(`**Anti-Spam** : ${message.author.tag} (${message.author.id}) a spammé. Message supprimé.`);
    }
});

// --- ANTI-RAID ---
client.on('guildMemberAdd', async member => {
    const guildId = member.guild.id;
    const now = Date.now();
    const members = raidTracker.get(guildId) || [];
    const updatedMembers = members.filter(ts => now - ts < 10000);
    updatedMembers.push(now);
    raidTracker.set(guildId, updatedMembers);

    if (updatedMembers.length >= 10) {
        const log = await client.channels.fetch(logChannels.raid);
        log.send(`⚠️ Anti-Raid activé : Plus de 10 membres ont rejoint en 10 secondes.`);
    }
});

// --- ANTI-BOTS ---
client.on('guildMemberAdd', async member => {
    if (member.user.bot) {
        const log = await client.channels.fetch(logChannels.bot);
        log.send(`⚠️ Bot détecté : ${member.user.tag} (${member.user.id})`);
    }
});

// --- ANTI-LIEN / NSFW ---
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const linkPattern = /(https?:\/\/[^\s]+)/g;
    if (linkPattern.test(message.content) || message.content.toLowerCase().includes('nsfw')) {
        await message.delete();
        const log = await client.channels.fetch(logChannels.spam);
        log.send(`❌ Message supprimé pour lien/NSFW par ${message.author.tag} (${message.author.id})`);
    }
});

// --- PROTECTION IDENTITE SERVEUR ---
client.on('guildUpdate', async (oldGuild, newGuild) => {
    const changes = [];
    if (oldGuild.name !== newGuild.name) changes.push('Nom changé');
    if (oldGuild.iconURL() !== newGuild.iconURL()) changes.push('Icône changée');
    if (oldGuild.region !== newGuild.region) changes.push('Région changée');
    if (changes.length > 0) {
        const log = await client.channels.fetch(logChannels.blacklist);
        log.send(`⚠️ Modification serveur détectée : ${changes.join(', ')}. Action possible.`);
    }
});

// --- CREATION MASSIVE DE SALONS ---
client.on('channelCreate', async channel => {
    const userId = channel.guild.ownerId; // À ajuster si possible pour détecter qui crée
    const now = Date.now();
    const channels = channelTracker.get(userId) || [];
    const updated = channels.filter(ts => now - ts < 3600000);
    updated.push(now);
    channelTracker.set(userId, updated);

    if (updated.length >= 10) {
        blacklist.add(userId);
        const log = await client.channels.fetch(logChannels.blacklist);
        log.send(`🚫 ${userId} blacklisté pour création massive de salons.`);
    }
});

// --- CREATION MASSIVE DE RÔLES ---
client.on('roleCreate', async role => {
    const userId = role.guild.ownerId; // À ajuster si possible pour détecter qui crée
    const now = Date.now();
    const roles = roleTracker.get(userId) || [];
    const updated = roles.filter(ts => now - ts < 3600000);
    updated.push(now);
    roleTracker.set(userId, updated);

    if (updated.length >= 10) {
        blacklist.add(userId);
        const log = await client.channels.fetch(logChannels.blacklist);
        log.send(`🚫 ${userId} blacklisté pour création massive de rôles.`);
    }
});

module.exports = client;
