// antiSpam.js — module anti-spam parfait et autonome

const { EmbedBuilder } = require("discord.js");

// CONFIG
const SPAM_LOG_CHANNEL = "1443327024323100813";
const MESSAGE_LIMIT = 5;            // 5 messages…
const INTERVAL_MS = 5000;           // …en 5 secondes
const TIMEOUT_MS = 12 * 60 * 1000;  // 12 minutes

// Map : guildId → Map(userId → timestamps)
const spamMap = new Map();

// Roles exemptés (staff)
const STAFF_ROLES = [
    "ADMINISTRATOR",
    "MANAGE_GUILD",
    "MANAGE_MESSAGES",
    "MODERATE_MEMBERS"
];

module.exports = {
    name: "antiSpam",
    init(client) {

        client.on("messageCreate", async (msg) => {
            try {
                if (!msg.guild) return;
                if (msg.author.bot) return;

                // STAFF EXEMPTÉ
                if (msg.member && msg.member.permissions.has(STAFF_ROLES)) return;

                const gid = msg.guild.id;
                const uid = msg.author.id;
                const now = Date.now();

                // Récupère ou crée la map de guilde
                const guildMap = spamMap.get(gid) || new Map();
                const timestamps = guildMap.get(uid) || [];

                timestamps.push(now);
                const window = timestamps.filter(t => now - t <= INTERVAL_MS);

                guildMap.set(uid, window);
                spamMap.set(gid, guildMap);

                // SI SPAM (5 messages / 5s)
                if (window.length >= MESSAGE_LIMIT) {

                    // Supprime messages récents de ce membre (dans ce salon)
                    try {
                        const recent = await msg.channel.messages.fetch({ limit: 50 });
                        const toDelete = recent.filter(m => m.author.id === uid);
                        for (const m of toDelete.values()) {
                            await m.delete().catch(() => {});
                        }
                    } catch {}

                    // Petit avertissement dans le salon
                    const warn = await msg.channel.send("⚠️ Merci d’éviter de spammer ce salon.");
                    setTimeout(() => warn.delete().catch(() => {}), 7000);

                    // Log dans le salon dédié
                    const logCh = await client.channels.fetch(SPAM_LOG_CHANNEL).catch(() => null);
                    if (logCh) {
                        const emb = new EmbedBuilder()
                            .setColor(0xff8800)
                            .setTitle("🔇 Spam détecté")
                            .addFields(
                                { name: "Membre", value: `${msg.author.tag} (${uid})` },
                                { name: "Salon", value: `${msg.channel.name} (${msg.channel.id})` },
                                { name: "Détails", value: `${window.length} messages en ${INTERVAL_MS / 1000}s` }
                            )
                            .setTimestamp();
                        logCh.send({ embeds: [emb] }).catch(() => {});
                    }

                    // Gestion des strikes pour sanction
                    const key = `strike_${gid}_${uid}`;
                    client.strikes = client.strikes || {};
                    const prev = client.strikes[key] || 0;
                    client.strikes[key] = prev + 1;

                    // 2ème fois → TIMEOUT 12 minutes
                    if (client.strikes[key] >= 2 && msg.member.moderatable) {
                        try {
                            await msg.member.timeout(
                                TIMEOUT_MS,
                                "Spam répété (automatique)"
                            );
                        } catch (e) {}

                        // Log de la sanction
                        if (logCh) {
                            const emb2 = new EmbedBuilder()
                                .setColor(0xff0000)
                                .setTitle("🔒 Timeout appliqué (anti-spam)")
                                .addFields(
                                    { name: "Membre", value: `${msg.author.tag} (${uid})` },
                                    { name: "Durée", value: "12 minutes" }
                                )
                                .setTimestamp();
                            logCh.send({ embeds: [emb2] }).catch(() => {});
                        }
                    }
                }

            } catch (err) {
                console.error("Anti-spam error:", err);
            }
        });

        console.log("Anti-spam chargé ✔");
    }
};
