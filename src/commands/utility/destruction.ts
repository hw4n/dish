import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('destruction')
    .setDescription('disconnects all user from the voice channel'),
    async execute(interaction: any) {
        // check if the user is an administrator
        if (interaction.member?.permissions instanceof PermissionsBitField && interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            Logger.info(`${interaction.user.id} is an administrator`);

            if (!interaction.guild) return;
            for (const [memberId, member] of interaction.guild.voiceStates.cache) {
                member.disconnect();
                Logger.success(`Disconnected ${memberId}`);
            }
            await interaction.reply({ content: 'Disconnected all users from the voice channel', ephemeral: true});
        } else {
            Logger.warning(`${interaction.user.id} is not an administrator`);
            await interaction.reply({ content: 'You must be an administrator to use this command', ephemeral: true});
        }
    },
};
