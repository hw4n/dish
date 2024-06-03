import { SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';
import axios from 'axios';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('searches for an image using the keyword provided')
    .addStringOption(option => option.setName('keyword').setDescription('Keyword of the query image').setRequired(true)),
    async execute(interaction: any) {
        await interaction.deferReply();

        axios.get(process.env.IMAGE_ENDPOINT!, { params: { keyword: interaction.options.getString('keyword') }}).then((response) => {
            interaction.editReply({ embeds: [{
                title: interaction.options.getString('keyword'),
                color: 14737632,
                image: {
                    url: response.data.src
                },
                footer: {
                    text: `${response.data.message}`
                }
            }]});
        }).catch((err) => {
            Logger.error(err);
            interaction.editReply({ content: err });
        });
    },
};
