import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';
import Word from '../../models/Word';
import Local from '../../helper/local';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('word')
    .setDescription('manage words that will be filtered from the chat')
    .addStringOption(option => option.setName('option').setDescription('add / remove / list').setRequired(true)
    .addChoices(
            { name: 'add', value: 'add' },
            { name: 'remove', value: 'remove' },
            { name: 'list', value: 'list' },
            { name: 'enable', value: 'enable'},
            { name: 'disable', value: 'disable'}
        ))
    .addStringOption(option => option.setName('word').setDescription('word to be added / removed').setRequired(false)),
    async execute(interaction: any) {
        if (!interaction.guild) return;
        await interaction.deferReply({ ephemeral: true });

        const option = interaction.options.getString('option');

        if (option === 'list') {
            return await interaction.editReply({ content: `Current word list is: ${Local.dsamList}`, ephemeral: true });
        }

        if (option === 'enable') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
                return await interaction.editReply({ content: 'You do not have permission to enable dsam', ephemeral: true });
            
            await Word.findOne({ word: '@@@enable@@@' }).then(async (word) => {
                if (word)
                    return await interaction.editReply({ content: 'dsam already enabled', ephemeral: true });

                await Word.create({ word: '@@@enable@@@' });
                Local.dsamList.push('@@@enable@@@');
                Local.dsamEnabled = true;
                Logger.info(`dsam enabled`);
                return await interaction.editReply({ content: `dsam enabled`, ephemeral: true });
            });
        }

        if (option === 'disable') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
                return await interaction.editReply({ content: 'You do not have permission to disable dsam', ephemeral: true });

            await Word.findOneAndDelete({ word: '@@@enable@@@' }).then(async (word) => {
                if (!word)
                    return await interaction.editReply({ content: 'dsam not enabled', ephemeral: true });

                Local.dsamList = Local.dsamList.filter((word) => word !== '@@@enable@@@');
                Local.dsamEnabled = false;
                Logger.info(`dsam disabled`);
                return await interaction.editReply({ content: `dsam disabled`, ephemeral: true });
            });
        }

        if (option !== 'add' || option !== 'remove') return;

        const inputWord = interaction.options.getString('word');
        if (!inputWord) {
            return await interaction.editReply({ content: 'Please provide a word', ephemeral: true });
        }

        if (option === 'add') {
            await Word.findOne({ word: inputWord }).then(async (word) => {
                if (word)
                    return await interaction.editReply({ content: 'Word already exists', ephemeral: true });

                await Word.create({ word: inputWord });
                Local.dsamList.push(inputWord);
                Logger.info(`'${inputWord}' added to list`);
                return await interaction.editReply({ content: `'${inputWord}' added to list`, ephemeral: true });
            });
        }

        if (option === 'remove') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
                return await interaction.editReply({ content: 'You do not have permission to remove words', ephemeral: true });

            await Word.findOneAndDelete({ word: inputWord }).then(async (word) => {
                if (!word)
                    return await interaction.editReply({ content: 'Word not found', ephemeral: true });

                Local.dsamList = Local.dsamList.filter((word) => word !== inputWord);
                Logger.info(`'${inputWord}' removed from list`);
                return await interaction.editReply({ content: `'${inputWord}' removed from list`, ephemeral: true });
            });
        }
    },
};
