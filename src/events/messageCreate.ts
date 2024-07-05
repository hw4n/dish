import { Events, Message } from 'discord.js';
import Logger from '../helper/logger';
import Chat from '../models/Chat';
import User from '../models/User';
import Local from '../helper/local';

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
        User.findOneAndUpdate({ id: message.author.id }, { id: message.author.id, $inc: { totalMessagesSent: 1 } }, { new: true, upsert: true })
            .then((user) => Logger.chat(`${message.author.id} totalMessagesSent ${user.totalMessagesSent}`));

        if (Local.dsamEnabled) {
            let possibleLinks = message.content.match('https://.+');
            let fire = false;
            if (possibleLinks) {
                for (let link of possibleLinks) {
                    if (fire) break;
                    let decodedLink = decodeURIComponent(link);
                    for (let word of Local.dsamList) {
                        if (decodedLink.includes(word)) {
                            fire = true;
                            break;
                        }
                    }
                }
            }

            if (fire) {
                if (Local.production) {
                    message.reply({ stickers: ['1258263821311807569'] });
                } else {
                    message.reply(':rocket:');
                }
                setTimeout(() => { message.delete() }, 500);
                User.findOneAndUpdate({ id: message.author.id }, { id: message.author.id, $inc: { totalMessagesNeutralized: 1 } }, { new: true, upsert: true })
                    .then((user) => Logger.chat(`${message.author.id} totalMessagesNeutralized ${user.totalMessagesNeutralized}`));
                Logger.warning(`[dsam] ${message.id} neutralized`);
            }
        }
    },
};
