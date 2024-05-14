import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';
import User from '../../models/User';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('reinit')
    .setDescription('sets every user\'s init flag to false'),
    async execute(interaction: any) {
        if (!interaction.guild) return;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        await User.find({}).then((users) => {
            users.forEach(user => {
                user.initialized = false;
                user.save();
                Logger.info(`Reinitialized ${user.id}`);
            });
        });
        await interaction.reply({ content: 'initialized flag reset for all users', ephemeral: true});
    },
};
