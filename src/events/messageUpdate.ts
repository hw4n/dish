import { Events, Message } from 'discord.js';
import Logger from '../helper/logger';

module.exports = {
    name: Events.MessageUpdate,
    execute(message: Message) {
        Logger.chatUpdate(`${message.author.id} : (${message.content}) -> (${message.reactions.message.content})`);
    },
};
