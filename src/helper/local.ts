import * as fs from 'fs';
import * as path from 'path';

class Local {
    static version = fs.readFileSync(path.join(__dirname, '../../', '.git', 'refs', 'heads', 'master'), 'utf8').slice(0, 7);
    static startDate = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export default Local;
