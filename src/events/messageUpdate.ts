import { Events, Message } from 'discord.js';
import Logger from '../helper/logger';
import Chat from '../models/Chat';
import * as CryptoJS from 'crypto-js';
import User from '../models/User';

module.exports = {
    name: Events.MessageUpdate,
    execute(message: Message) {
        if (message.author.bot) return;
        if (message.guildId !== (process.env.DISCORD_PRODGUILD || process.env.DISCORD_TESTGUILD || "")) return;

        Chat.findOne({
            cid: CryptoJS.MD5(message.author.id + message.createdTimestamp).toString(CryptoJS.enc.Hex)
        }).then((chat) => {
            if (!chat) return;

            let updatedMessage = CryptoJS.AES.encrypt(message.reactions.message.content, process.env.CRYPTO_KEY + message.author.id).toString();

            if (chat.message === updatedMessage) return

            chat.history.push(chat.message);
            chat.message = updatedMessage;
            chat.edited = true;

            chat.save().then(() => Logger.chatUpdate(`${chat.cid} edited`));
        });
        User.findOneAndUpdate({ id: message.author.id }, { id: message.author.id, $inc: { totalMessagesEdited: 1 } }, { new: true, upsert: true })
        .then((user) => Logger.chat(`${message.author.id} totalMessagesEdited ${user.totalMessagesEdited}`));
    },
};
