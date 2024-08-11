import { SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';
import OpenAI from 'openai';
import Local from '../../helper/local';
import User from '../../models/User';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_APIKEY,
});

module.exports = {
    data: new SlashCommandBuilder()
    .setName('gpt')
    .setDescription('Generates answer from GPT model')
    .addStringOption(option => option.setName('question').setDescription('Question to ask').setRequired(true))
    .addStringOption(option => option.setName('image').setDescription('Image URL to attach').setRequired(false)),
    async execute(interaction: any) {
        Logger.info(`${interaction.user.id} asked (${interaction.options.getString('question')})`);
        await interaction.deferReply();

        let content: [any] = [{ type: 'text', text: interaction.options.getString('question') }];
        if (interaction.options.getString('image')) {
            content.push({ type: 'image_url', image_url: { url: interaction.options.getString('image') } });
        }

        await openai.chat.completions.create({
            messages: [{ role: 'user', content }],
            model: 'gpt-4o-mini',
            max_tokens: 1000,
        }).then(chatCompletion => {
            let reply = `## [Q] ${content[0].text}\n## [A]\n` + chatCompletion.choices[0].message.content!;
            const chunks = reply.match(/[\s\S]{1,2000}/g);
            interaction.editReply({ content: chunks![0] });
            for (let i = 1; i < chunks!.length; i++) {
                interaction.followUp({ content: chunks![i] });
            }
            User.findOneAndUpdate({ id: interaction.user.id }, { id: interaction.user.id, $inc: { tokensUsed: chatCompletion.usage?.total_tokens } })
                .then((user) => Logger.chat(`${interaction.user.id} tokensUsed ${user?.tokensUsed} (${chatCompletion.usage?.prompt_tokens} + ${chatCompletion.usage?.completion_tokens})`));
            return;
        }).catch((err) => {
            Logger.error(err);
            interaction.followUp({ content: err.message });
        });
    },
};
