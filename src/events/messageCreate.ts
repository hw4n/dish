import { Events, Message } from 'discord.js';
import Logger from '../helper/logger';
import Chat from '../models/Chat';

module.exports = {
    name: Events.MessageCreate,
    execute(message: Message) {
        if (message.author.bot) return;
        if (message.guildId !== (process.env.DISCORD_PRODGUILD || process.env.DISCORD_TESTGUILD || "")) return;
        if (!message.content) {
            if (message.attachments) {
                const attachments = message.attachments.map(a => ({name: a.name, link: a.url}));
                for (const attachment of attachments) {
                    Chat.create({ author: message.author.id, message: `<attachment> ${attachment.name} (${attachment.link})`, timestamp: message.createdTimestamp })
                        .then((chat) => Logger.chat(`${chat.cid} created`));
                }
            }
            if (message.stickers) {
                const stickers = message.stickers.map(s => ({name: s.name, id: s.id}));
                for (const sticker of stickers) {
                    Chat.create({ author: message.author.id, message: `<sticker> ${sticker.name} (${sticker.id})`, timestamp: message.createdTimestamp })
                        .then((chat) => Logger.chat(`${chat.cid} created`));
                }
            }
            return;
        }
        Chat.create({ author: message.author.id, message: message.content, timestamp: message.createdTimestamp })
            .then((chat) => Logger.chat(`${chat.cid} created`));
    },
};
