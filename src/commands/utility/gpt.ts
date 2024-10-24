import { SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';
import Local from '../../helper/local';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gpt')
    .setDescription('Generates answer from GPT model')
    .addStringOption(option => option.setName('question').setDescription('Question to ask').setRequired(true))
    .addStringOption(option => option.setName('image').setDescription('Image URL to attach').setRequired(false)),
    async execute(interaction: any) {
        let question = interaction.options.getString('question');
        let image_url = interaction.options.getString('image');
        Logger.info(`${interaction.user.id} asked (${question})`);
        await interaction.deferReply();

        Local.gpt.Ask(question, image_url).then((response) => {
            let reply = `## [Q] ${question}\n## [A]\n` + response;
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
