import { SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';
import Local from '../../helper/local';

// load prompt.txt to variable
const fs = require('fs');
const path = require('path');
// put expected start prompt to prompt.txt
const prompt = fs.readFileSync(path.resolve(__dirname, '../../../msg_prompt.txt'), 'utf8');

const msgAsk = Local.gpt.createCustomCompletion(prompt);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('msg')
    .setDescription('Generates answer from msgkGPT model')
    .addStringOption(option => option.setName('question').setDescription('Question to ask').setRequired(true))
    .addStringOption(option => option.setName('image').setDescription('Image URL to attach').setRequired(false)),
    async execute(interaction: any) {
        let question = interaction.options.getString('question');
        let image_url = interaction.options.getString('image');
        Logger.info(`${interaction.user.id} asked m_(${interaction.options.getString('question')})`);
        await interaction.deferReply();

        msgAsk(question, image_url).then((response) => {
            let reply = `## [m_Q] ${question}\n## [m_A]\n` + response;
            const chunks = reply.match(/[\s\S]{1,2000}/g);
            interaction.editReply({ content: chunks![0] });
            for (let i = 1; i < chunks!.length; i++) {
                interaction.followUp({ content: chunks![i] });
            }
            return;
        }).catch((err) => {
            Logger.error(err);
            interaction.followUp({ content: err.message });
        });
    },
};
