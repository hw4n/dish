import { Events, Interaction } from 'discord.js';
import Logger from '../helper/logger';

module.exports = {
    name: Events.InteractionCreate,
    execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            Logger.warning(`Command '${interaction.commandName}' not found`);
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
    },
};