import { SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';
import OpenAI from 'openai';
import Local from '../../helper/local';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_APIKEY,
});

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gpt')
    .setDescription('Generates answer from GPT model')
    .addStringOption(option => option.setName('question').setDescription('Question to ask').setRequired(true)),
    async execute(interaction: any) {
        Logger.info(`${interaction.user.id} asked (${interaction.options.getString('question')})`);
        await interaction.deferReply();
        await openai.chat.completions.create({
            messages: [{role: 'user', content: interaction.options.getString('question')}],
            model: 'gpt-4o',
            max_tokens: 1000,
        }).then(chatCompletion => {
            const chunks = chatCompletion.choices[0].message.content!.match(/[\s\S]{1,2000}/g);
            interaction.editReply({ content: chunks![0] });
            for (let i = 1; i < chunks!.length; i++) {
                interaction.followUp({ content: chunks![i] });
            }
            return;
        }).catch((err) => {
            Logger.error(err);
            interaction.reply({ content: `${err.status} ${err.name}` });
        });
    },
};
