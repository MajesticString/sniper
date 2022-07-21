import { Colors, GuildMember, Message, User } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import {
  getMentionedMember,
  getMentionedUser,
} from '../../utils/helpers/mention.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class WhoisCommand extends BaseCommand {
  constructor() {
    super('whois', 'util', [], 3000, 'shows info about a user');
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const user: User = getMentionedUser(message, args); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const member: GuildMember = getMentionedMember(message, args)!;

    if (!user && !member) {
      reply(message, {
        title: "That user doesn't exist",
        description: 'Try mentioning the user',
        color: Colors.Red,
      });
      return;
    }

    if (!message.guild?.members.cache.has(user.id)) {
      reply(message, {
        title: 'That user is not in this server',
        description:
          'Make sure that user is in that server before using this command.',
        color: Colors.Red,
      });
      return;
    }

    reply(message, {
      title: `${user.tag}${member.nickname ? `(${member.nickname})` : ''}`,
      thumbnail: {
        url: user.avatarURL({ extension: 'webp' }) || user.defaultAvatarURL,
      },
      fields: [
        {
          name: 'ID',
          value: user.id,
          inline: true,
        },
        {
          name: 'Avatar',
          value: `[Link](${
            user.avatarURL({ extension: 'webp' }) || user.defaultAvatarURL
          })`,
          inline: true,
        },
        {
          name: 'Account Created',
          value: new Date(user.createdTimestamp).toUTCString(),
          inline: true,
        },
        {
          name: 'Account Age',
          value: new Date(Date.now() - user.createdTimestamp)
            .toISOString()
            .slice(11, -1),
          inline: true,
        },
        {
          name: 'Joined Server At',
          value: member.joinedAt?.toUTCString() || "Couldn't get info",
          inline: true,
        },
        {
          name: 'Join Server Age',
          value: new Date(Date.now() - (member.joinedAt?.getTime() ?? 0))
            .toISOString()
            .slice(11, -1),
        },

        {
          name: 'Display Color',
          value: member.displayHexColor,
          inline: true,
        },
        {
          name: 'Permissions',
          value: member.permissions
            .toArray()
            .map((val) => `\`${val}\``)
            .toString(),
          inline: false,
        },
        {
          name: 'Roles',
          value: member.roles.cache
            .sort((f, s) => s.position - f.position)
            .map((val) => `${val}`)
            .toString(),
          inline: true,
        },
        // {
        //   name: 'Banner',
        //   value: `[Link](${user.})`,
        //   inline: true,
        // },
      ],
    });
  }
}
