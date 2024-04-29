import { Events, Client } from 'discord.js';
import Logger from '../helper/logger';
import Local from '../helper/local';

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        if (!client.user) return;
        client.user.setPresence({ activities: [{ name: `LC: ${Local.version}, S: ${Local.startDate}` }], status: 'online' });
        Logger.success(`Logged in as ${client.user.tag}`);
    },
};
