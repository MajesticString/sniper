import type { Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class RoleCommand extends BaseCommand {
  constructor() {
    super('role', 'util', [], 5000, 'Gets information about a role.', {
      argsDescription:
        '[mentioned role OR role id OR role name. defaults to @everyone]',
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const role =
      message.mentions.roles.first() ||
      message.guild?.roles.cache.get(args[0]) ||
      message.guild?.roles.cache.find((r) => r.name === args.join(' ')) ||
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      message.guild!.roles.everyone;
    reply(message, {
      title: `${role.name}`,
      description: `${role.toString()}`,
      color: role.color,
      fields: [
        {
          name: 'Emoji',
          value: `Role emoji: ${role.iconURL({ extension: 'webp' }) || 'none'}`,
          inline: true,
        },
        {
          name: 'Color',
          value: `Role color: ${role.hexColor || 'none'}`,
          inline: true,
        },
        {
          name: 'Position',
          value: `Role position: ${role.position}`,
          inline: true,
        },
        {
          name: 'Mentionable',
          value: `${role.mentionable ? 'yes' : 'no'}`,
          inline: true,
        },
        {
          name: 'Hoisted',
          value: `${role.hoist ? 'yes' : 'no'}`,
          inline: true,
        },
        {
          name: 'Managed',
          value: `${role.managed ? 'yes' : 'no'}`,
          inline: true,
        },
        {
          name: 'Created at',
          value: `Role created at: ${role.createdAt.toLocaleString()}`,
          inline: true,
        },
        {
          name: 'Permissions',
          value: `${
            role.permissions
              .toArray()
              .map((v) => `\`${v}\``)
              .toString() || 'No permissions'
          }`,
          inline: true,
        },
      ],
    });
  }
}
