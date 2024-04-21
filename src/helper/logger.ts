import chalk from 'chalk';

class Logger {
    static info(message: string) {
        console.log(chalk.blue(`INFO: ${message}`));
    }

    static warning(message: string) {
        console.log(chalk.yellow(`WARNING: ${message}`));
    }

    static error(message: string) {
        console.log(chalk.red(`ERROR: ${message}`));
    }

    static success(message: string) {
        console.log(chalk.green(`SUCCESS: ${message}`));
    }
}

export default Logger;