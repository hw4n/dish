import * as fs from 'fs';
import * as path from 'path';
import { OpenAI } from 'openai';

class Local {
    static version = fs.readFileSync(path.join(__dirname, '../../', '.git', 'refs', 'heads', 'master'), 'utf8').slice(0, 7);
    static startDate = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false});
    static production = typeof process.env.DISCORD_PRODGUILD !== 'undefined';
    static targetGuild = process.env.DISCORD_PRODGUILD || process.env.DISCORD_TESTGUILD || "";
    static dsamList: string[] = [];
    static dsamEnabled = false;
    static userTempData: { [key: string]: { heat: number, cooldown: number } } = {};
    static openai = new OpenAI();
};

export default Local;
