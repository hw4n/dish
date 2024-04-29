import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('destruction')
    .setDescription('disconnects all user from the voice channel'),
    async execute(interaction: any) {
        if (!interaction.guild) return;
        for (const [memberId, member] of interaction.guild.voiceStates.cache) {
            member.disconnect();
            Logger.success(`Disconnected ${memberId}`);
        }
        await interaction.reply({ content: 'Disconnected all users from the voice channel', ephemeral: true});
    },
};
