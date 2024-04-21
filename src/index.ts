import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';

import * as fs from 'fs';
import * as path from 'path';

const token = process.env.DISCORD_TOKEN;
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildVoiceStates
]});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands'); // we'll be working on {pwd}\commands
const thingsInPath = fs.readdirSync(commandsPath); // read dirs/files in {pwd}\commands
console.log(`[INFO] Found '${thingsInPath}' in ${commandsPath}`);

for (const thing of thingsInPath) { 
	// because we don't know if it's a file or a directory
	const thingPath = path.join(commandsPath, thing);
	console.log(`[INFO] Checking '${thing}'`);

	if (fs.statSync(thingPath).isFile()) {
		console.log(`[SKIP] '${thing}' is not a directory`);
		continue;
	}
	console.log(`[INFO] '${thing}' is a directory`);

	// now we're sure it's a directory, let's read .js files in it
	const commandFiles = fs.readdirSync(thingPath).filter(file => file.endsWith('.js'));
	console.log(`[INFO] Found '${commandFiles}' in '${thing}'`);

	// iterate through .js files
	for (const file of commandFiles) {
		const filePath = path.join(thingPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			console.log(`[INFO] Successfully loaded '${command.data.name}' from '${file}'`);
		} else {
			console.log(`[WARN] The command at ${filePath} is missing a required 'data' or 'execute' property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);
