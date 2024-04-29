import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';

import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';

import Logger from './helper/logger';

const token = process.env.DISCORD_TOKEN;
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildVoiceStates
]});

client.commands = new Collection();

Logger.debug(`Loading commands from ${__dirname}/commands`);
const commandsPath = path.join(__dirname, 'commands'); // we'll be working on {pwd}\commands
const thingsInPath = fs.readdirSync(commandsPath); // read dirs/files in {pwd}\commands
Logger.info(`Found '${thingsInPath}' in ${commandsPath}`);

for (const thing of thingsInPath) { 
	// because we don't know if it's a file or a directory
	const thingPath = path.join(commandsPath, thing);
	Logger.info(`Checking '${thing}'`);

	if (fs.statSync(thingPath).isFile()) {
		console.log(`[SKIP] '${thing}' is not a directory`);
		continue;
	}
	Logger.info(`'${thing}' is a directory`);

	// now we're sure it's a directory, let's read .js files in it
	const commandFiles = fs.readdirSync(thingPath).filter(file => file.endsWith('.js'));
	Logger.info(`Found '${commandFiles}' in '${thing}'`);

	// iterate through .js files
	for (const file of commandFiles) {
		const filePath = path.join(thingPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			Logger.success(`Successfully loaded '${command.data.name}' from '${file}'`);
		} else {
			Logger.warning(`The command at ${filePath} is missing a required 'data' or 'execute' property.`);
		}
	}
}

Logger.debug(`Loading event handlers from ${__dirname}/events`);
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
Logger.info(`Found '${eventFiles}' in ${eventsPath}`);

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// add database connection here

if (!process.env.MONGODB_URI) {
	Logger.error('MONGODB_URI is not defined in .env');
	process.exit(1);
}

mongoose.connection.on('connected', () => {
	Logger.success('Connected to MongoDB');
});

mongoose.connect(process.env.MONGODB_URI);

client.login(token);
