import { AttachmentBuilder, Message, SlashCommandBuilder } from 'discord.js';
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

        let lastEdit = new Date();

        Local.gpt.AskStreaming({user_prompt: question, image_url}, async(string_chunk) => {
            if (string_chunk.length < 1900 && lastEdit.getTime() + 500 < new Date().getTime()) {            
                await interaction.editReply({ content: `## [Q] ${question}\n## [A]\n` + string_chunk });
                lastEdit = new Date();
            }
            return Promise.resolve();
        }).then(async(response) => {
            let reply = `## [Q] ${question}\n## [A]\n` + response;
            const chunks = reply.match(/[\s\S]{1,2000}/g);
            await interaction.editReply({ content: chunks![0] });
            for (let i = 1; i < chunks!.length; i++) {
                await interaction.followUp({ content: chunks![i] });
            }
            return;
        }).catch((err) => {
            Logger.error(err);
            interaction.followUp({ content: err.message });
        });
    },
};
