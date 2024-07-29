import { Request, Response } from 'express';
import * as CryptoJS from 'crypto-js';
import User from '../models/User';

const getUsers = async (req: Request, res: Response) => {
    try {
        const chats = await User.find();
        res.json(CryptoJS.AES.encrypt(JSON.stringify(chats), process.env.CRYPTO_KEY!).toString());
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    getUsers,
};
