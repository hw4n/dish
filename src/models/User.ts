import mongoose, { Document, Model, Schema } from 'mongoose';
import Chat from './Chat';
import Logger from '../helper/logger';

interface IUser extends Document {
    id: string;
    initialized: boolean;
    totalMessagesSent: number;
    totalMessagesEdited: number;
    totalMessagesDeleted: number;
    totalCommandsExecuted: number;
    initialize(): Promise<void>;
}

const userSchema = new Schema<IUser>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    initialized: {
        type: Boolean,
        default: false
    },
    totalMessagesSent: {
        type: Number,
        default: 0
    },
    totalMessagesEdited: {
        type: Number,
        default: 0
    },
    totalMessagesDeleted: {
        type: Number,
        default: 0
    },
    totalCommandsExecuted: {
        type: Number,
        default: 0
    }
});

userSchema.methods.initialize = async function() {
    Logger.info(`Initializing statistics for ${this.id}`);
    this.totalMessagesSent = (await Chat.find({ author: this.id, edited: false, deleted: false })).length;
    this.totalMessagesEdited = (await Chat.find({ author: this.id, edited: true, deleted: false })).length;
    this.totalMessagesDeleted = (await Chat.find({ author: this.id, deleted: true })).length;
    this.initialized = true;
    this.save();
    Logger.info(`Statistics initialized for ${this.id} - ${this.totalMessagesSent}, ${this.totalMessagesEdited}, ${this.totalMessagesDeleted}`);
};

userSchema.post('init', async function() {
    const _t = this as IUser;
    if (!_t.initialized) {
        await _t.initialize();
    }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
