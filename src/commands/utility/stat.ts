import { SlashCommandBuilder } from 'discord.js';
import Logger from '../../helper/logger';
import Local from '../../helper/local';
import User from '../../models/User';

module.exports = {
    data: new SlashCommandBuilder()
    .setName('stat')
    .setDescription('Replies with user\'s statistics'),
    async execute(interaction: any) {
        await interaction.deferReply();
        await User.findOne({ id: interaction.user.id }).then((user) => {
            if (!user) {
                interaction.editReply({ content: `No statistics found for ${interaction.user.toString()}` });
                return;
            }
            interaction.editReply({ embeds: [{
                title: `${interaction.user.globalName}'s statistics`,
                color: 14737632,
                fields: [
                    {
                        name: "sent",
                        value: user.totalMessagesSent,
                        inline: true
                    },
                    {
                        name: "edited",
                        value: user.totalMessagesEdited,
                        inline: true
                    },
                    {
                        name: "deleted",
                        value: user.totalMessagesDeleted,
                        inline: true
                    },
                    {
                        name: "commands",
                        value: user.totalCommandsExecuted,
                        inline: true
                    }],
                thumbnail: {
                    url: interaction.user.avatarURL()
                }
            }]});
        }).catch((err) => {
            Logger.error(err);
            interaction.reply({ content: `${err.status} ${err.name}` });
        });
    },
};
