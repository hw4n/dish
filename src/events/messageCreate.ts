import { Events, Message } from 'discord.js';
import Logger from '../helper/logger';

module.exports = {
    name: Events.MessageCreate,
    execute(message: Message) {
        if (!message.content) {
            if (message.attachments) {
                const attachments = message.attachments.map(a => ({name: a.name, link: a.url}));
                for (const attachment of attachments) {
                    Logger.chat(`${message.author.id} : <attachment> ${attachment.name} (${attachment.link})`);
                }
            }
            if (message.stickers) {
                const stickers = message.stickers.map(s => ({name: s.name, id: s.id}));
                for (const sticker of stickers) {
                    Logger.chat(`${message.author.id} : <sticker> ${sticker.name} (${sticker.id})`);
                }
            }
            return;
        }
        Logger.chat(`${message.author.id} : ${message.content}`);
    },
};
