import { Events, Interaction } from 'discord.js';
import Logger from '../helper/logger';
import User from '../models/User';

module.exports = {
    name: Events.InteractionCreate,
    execute(interaction: Interaction) {
        if (interaction.user.bot) return;
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            Logger.warning(`Command '${interaction.commandName}' not found`);
            return;
        }

        try {
            command.execute(interaction);
            User.findOneAndUpdate({ id: interaction.user.id }, { id: interaction.user.id, $inc: { totalCommandsExecuted: 1 } }, { new: true, upsert: true })
                .then((user) => Logger.chat(`${interaction.user.id} totalCommandsExecuted ${user.totalCommandsExecuted}`));
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
