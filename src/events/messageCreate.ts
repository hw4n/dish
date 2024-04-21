import { Events, Message } from 'discord.js';
import Logger from '../helper/logger';

module.exports = {
    name: Events.MessageCreate,
    once: true,
    execute(message: Message) {
        Logger.chat(`${message.author.id} : ${message.content}`);
    },
};
