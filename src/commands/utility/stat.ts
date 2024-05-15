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
        
        await User.findOne({ id: interaction.user.id }).then(async (user) => {
            if (!user) {
                interaction.editReply({ content: `No statistics found for ${interaction.user.toString()}` });
                return;
            }

            const sentRank = await User.countDocuments({ totalMessagesSent: { $gt: user.totalMessagesSent } });
            const editedRank = await User.countDocuments({ totalMessagesEdited: { $gt: user.totalMessagesEdited } });
            const deletedRank = await User.countDocuments({ totalMessagesDeleted: { $gt: user.totalMessagesDeleted } });
            const commandRank = await User.countDocuments({ totalCommandsExecuted: { $gt: user.totalCommandsExecuted } });
            const balanceRank = await User.countDocuments({ balance: { $gt: user.balance } });
            
            interaction.editReply({ embeds: [{
                title: `${interaction.user.globalName}'s statistics`,
                color: 14737632,
                fields: [
                    {
                        name: "sent",
                        value: `${user.totalMessagesSent} (#${sentRank + 1})`,
                        inline: true
                    },
                    {
                        name: "edited",
                        value: `${user.totalMessagesEdited} (#${editedRank + 1})`,
                        inline: true
                    },
                    {
                        name: "deleted",
                        value: `${user.totalMessagesDeleted} (#${deletedRank + 1})`,
                        inline: true
                    },
                    {
                        name: "commands",
                        value: `${user.totalCommandsExecuted} (#${commandRank + 1})`,
                        inline: true
                    },
                    {
                        name: "balance",
                        value: `${user.balance} (#${balanceRank + 1})`,
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
