import { Events, Message } from 'discord.js';
import Logger from '../helper/logger';

module.exports = {
    name: Events.MessageUpdate,
    execute(message: Message) {
        if (message.guildId !== (process.env.DISCORD_PRODGUILD || process.env.DISCORD_TESTGUILD || "")) return;
        Logger.chatUpdate(`${message.author.id} : (${message.content}) -> (${message.reactions.message.content})`);
    },
};
