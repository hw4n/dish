import { SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_APIKEY,
});

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gpt')
    .setDescription('Generates answer from GPT model')
    .addStringOption(option => option.setName('question').setDescription('Question to ask').setRequired(true)),
    async execute(interaction: any) {
        await interaction.deferReply();
        await openai.chat.completions.create({
            messages: [{role: 'user', content: interaction.options.getString('question')}],
            model: 'gpt-3.5-turbo',
            max_tokens: 500,
        }).then(chatCompletion => {
            interaction.editReply({ content: chatCompletion.choices[0].message.content });
        }).catch((err) => {
            Logger.error(err);
            interaction.reply({ content: `${err.status} ${err.name}` });
        });
    },
};
