import chalk from 'chalk';
class Logger {
    static info(message: string) {
        console.log(chalk.blue(`[INFO] ${message}`));
    }

    static warning(message: string) {
        console.log(chalk.yellow(`[WARN] ${message}`));
    }

    static error(message: string) {
        console.log(chalk.red(`[ERROR] ${message}`));
    }

    static success(message: string) {
        console.log(chalk.green(`[DONE] ${message}`));
    }

    static debug(message: string) {
        console.log(chalk.bgCyan(`[DEBUG] ${message}`));
    }

    static chat(message: string) {
        console.log(chalk.inverse(`[CHAT CREATE] ${message}`));
    }

    static chatUpdate(message: string) {
        console.log(chalk.bgYellow(`[CHAT UPDATE] ${message}`));
    }

    static chatDelete(message: string) {
        console.log(chalk.bgMagenta(`[CHAT DELETE] ${message}`));
    }
}

export default Logger;
