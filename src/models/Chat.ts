import mongoose, { Document, Schema } from 'mongoose';
import * as CryptoJS from 'crypto-js';

interface IChat extends Document {
    author: string; // snowflakes
    message: string; // must be encrypted
    timestamp: Number; // unix timestamp from the message
    cid: string; // hashed create timestamp + author
    edited: boolean;
    deleted: boolean;
    history: Array<string>; // array of previous messages
}

const chatSchema: Schema = new Schema({
    author: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Number, required: true },
    cid: { type: String, required: true, default: function () {
        const _t = this as IChat;
        const hashed = CryptoJS.MD5(_t.author + _t.timestamp);
        return hashed.toString(CryptoJS.enc.Hex);
    }},
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    history: { type: Array, default: [] },
});

// middleware that encrypts the message before saving
chatSchema.pre('save', function (next) {
    const _t = this as unknown as IChat;
    if (!_t.deleted) {
        _t.message = CryptoJS.AES.encrypt(_t.message, process.env.CRYPTO_KEY + _t.author).toString();
    } else {
        _t.message = '';
    }
    next();
});

const Chat = mongoose.model<IChat>('Chat', chatSchema);

export default Chat;
