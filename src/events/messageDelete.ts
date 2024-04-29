import { Events, Message } from 'discord.js';
import Logger from '../helper/logger';
import Chat from '../models/Chat';
import * as CryptoJS from 'crypto-js';

module.exports = {
    name: Events.MessageDelete,
    execute(message: Message) {
        if (message.guildId !== (process.env.DISCORD_PRODGUILD || process.env.DISCORD_TESTGUILD || "")) return;

        Chat.findOne({
            cid: CryptoJS.MD5(message.author.id + message.createdTimestamp).toString(CryptoJS.enc.Hex)
        }).then((chat) => {
            if (!chat) return;

            chat.history.push(chat.message);
            chat.deleted = true;

            chat.save().then(() => Logger.chatDelete(`${chat.cid} deleted`));
        });
    },
};
