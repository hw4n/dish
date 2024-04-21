import { Events, Client } from 'discord.js';

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        if (!client.user) return;
        console.log(`[INFO] Logged in as ${client.user.tag}`);
    },
};
