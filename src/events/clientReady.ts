import { Events, Client } from 'discord.js';
import Logger from '../helper/logger';

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        if (!client.user) return;
        Logger.success(`Logged in as ${client.user.tag}`);
    },
};
