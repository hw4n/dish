import { Events, Client } from 'discord.js';
import Logger from '../helper/logger';
import Local from '../helper/local';
import User from '../models/User';

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
        if (!client.user) return;
        if (Local.production) {
            client.user.setPresence({ activities: [{ name: `LC: ${Local.version}, S: ${Local.startDate}` }], status: 'online' });
        } else {
            Logger.debug(`Development mode detected, ignoring presence setting`);
        }
        Logger.success(`Logged in as ${client.user.tag}`);

        client.guilds.cache.get(Local.targetGuild)?.members.fetch().then(members => {
            members.map(member => {
                return {
                    nickname: member.nickname || member.user.globalName || member.user.username,
                    id: member.id,
                    avatar: member.user.displayAvatarURL(),
                }
            }).forEach(member => {
                User.findOne({ id: member.id }).then(user => {
                    if (!user) return;
                    user.nickname = member.nickname;
                    user.avatar = member.avatar;
                    user.save();
                });
            });
        });
    },
};
