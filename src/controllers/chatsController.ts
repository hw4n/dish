import { Request, Response } from 'express';
import Chat from '../models/Chat';

const getChats = async (req: Request, res: Response) => {
    try {
        const chats = await Chat.find().sort({ timestamp: -1 }).limit(100);
        res.json(chats);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getChats,
};
