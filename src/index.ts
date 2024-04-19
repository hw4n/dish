import "dotenv/config";
import { Client, GatewayIntentBits, Events, Collection, ChatInputCommandInteraction, Message, PermissionsBitField } from "discord.js";

import * as fs from "fs";
import * as path from "path";

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
console.log(`[INFO] Found "${thingsInPath}" in ${commandsPath}`);

for (const thing of thingsInPath) { 
	// because we don't know if it's a file or a directory
	const thingPath = path.join(commandsPath, thing);
	console.log(`[INFO] Checking "${thing}"`);

	if (fs.statSync(thingPath).isFile()) {
		console.log(`[SKIP] "${thing}" is not a directory`);
		continue;
	}
	console.log(`[INFO] "${thing}" is a directory`);

	// now we're sure it's a directory, let's read .js files in it
	const commandFiles = fs.readdirSync(thingPath).filter(file => file.endsWith('.js'));
	console.log(`[INFO] Found "${commandFiles}" in "${thing}"`);

	// iterate through .js files
	for (const file of commandFiles) {
		const filePath = path.join(thingPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			console.log(`[INFO] Successfully loaded "${command.data.name}" from "${file}"`);
		} else {
			console.log(`[WARN] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`[INFO] Logged in as ${readyClient.user?.tag}`);
});

client.on(Events.MessageCreate, (message: Message) => {
	console.log(`${message.author.id} : ${message.content}`);
});

client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.log(`[WARN] Command "${interaction.commandName}" not found`);
		return;
	}

	try {
		command.execute(interaction);
	} catch (error) {
		console.error(error);
		
		if (interaction.deferred || interaction.replied) {
			interaction.followUp({ content: 'Error while executing, refer to console for more information.', ephemeral: true });
		} else {
			interaction.reply({ content: 'Error while executing, refer to console for more information.', ephemeral: true });
		}
	}
});

client.login(token);
