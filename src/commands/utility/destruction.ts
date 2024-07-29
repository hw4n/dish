import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('destruction')
    .setDescription('disconnects all user from the voice channel')
    .addIntegerOption(option => option.setName('minute').setDescription('time in minutes to disconnect').setRequired(false)),
    async execute(interaction: any) {
        if (!interaction.guild) return;
        
        if (!interaction.options.getInteger('minute'))
            await interaction.reply({ content: 'Disconnecting all users from the voice channel', ephemeral: true });
        else
            await interaction.reply({ content: `Disconnecting all users from the voice channel in ${interaction.options.getInteger('minute')} minutes`, ephemeral: true });
        
        setTimeout(async() => {
            for (const [memberId, member] of interaction.guild.voiceStates.cache) {
                member.disconnect();
                Logger.success(`${interaction.user.id} disconnected ${memberId}`);
            }
        }, interaction.options.getInteger('minute') * 60 * 1000);
    },
};
