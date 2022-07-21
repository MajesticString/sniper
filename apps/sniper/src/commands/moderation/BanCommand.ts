import {
  Colors,
  GuildMember,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class BanCommand extends BaseCommand {
  constructor() {
    super('ban', 'moderation', [], 100, 'Bans any amount of members.', {
      argsDescription: '<@user or userID> <user> <user> ...',
      permissions: ['BanMembers'],
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const users: GuildMember[] = [];
    if (!message.member?.permissions.has(PermissionFlagsBits.BanMembers)) {
      reply(message, {
        title: 'really?',
        description: 'You do not have the `BAN_MEMBERS` permission.',
        color: Colors.Red,
      });
      return;
    }
    if (
      !message.guild?.members.me?.permissions.has(
        PermissionFlagsBits.BanMembers
      ) ||
      !(message.channel as TextChannel)
        .permissionsFor(message.guild.members.me)
        .has(PermissionFlagsBits.BanMembers)
    ) {
      reply(message, {
        title: 'I do not have the `BAN_MEMBERS` permission.',
        color: Colors.Red,
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
          (member.nickname || member.user.username)
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
      user.ban();
    });
  }
}
