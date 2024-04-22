import mongoose, { Document, Schema } from 'mongoose';

interface IChat extends Document {
    uid: string; // snowflakes
    message: string;
    timestamp: Date;
}

const chatSchema: Schema = new Schema({
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model<IChat>('Chat', chatSchema);

export default Chat;
