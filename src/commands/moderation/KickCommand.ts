import { GuildMember, Message, TextChannel } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { reply } from '../../utils/helpers/reply';

export default class KickCommand extends BaseCommand {
  constructor() {
    super('kick', 'moderation', [], 100, 'kicks a user');
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const users: GuildMember[] = [];
    if (!message.member?.permissions.has('KICK_MEMBERS')) {
      reply(message, {
        title: 'really?',
        description: 'You do not have the `KICK_MEMBERS` permission.',
        color: 'RED',
      });
      return;
    }
    if (
      !message.guild?.me?.permissions.has('KICK_MEMBERS') ||
      !(message.channel as TextChannel)
        .permissionsFor(message.guild.me)
        .has('KICK_MEMBERS')
    ) {
      reply(message, {
        title: 'I do not have the `KICK_MEMBERS` permission.',
        color: 'RED',
      });
      return;
    }
    for (const arg of args) {
      const user =
        message.mentions.members?.first() ||
        message.guild?.members.cache.find(
          (member) => member.user.username.toLowerCase() === arg.toLowerCase()
        ) ||
        message.guild?.members.cache.find(
          (member) => member.nickname?.toLowerCase() === arg.toLowerCase()
        ) ||
        message.guild?.members.cache.find((member) =>
          (member.user.username ?? member.nickname)
            .toLowerCase()
            .includes(arg.toLowerCase())
        ) ||
        message.guild?.members.cache.get(arg);

      if (!user) {
        message.channel.send(`Couldn't find user ${arg} in this server.`);
        return;
      } else {
        users.push(user);
      }
    }
    users.forEach((user) => {
      user.kick();
    });
  }
}
