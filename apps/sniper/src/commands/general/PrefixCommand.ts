import { Colors, Message, PermissionFlagsBits } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class PrefixCommand extends BaseCommand {
  constructor() {
    super(
      'prefix',
      'general',
      ['prefixes'],
      5000,
      'Shows the prefixes that this bot has. Can also be used to set the prefixes. Prefixes must be separated by a space.',
      {
        argsDescription: '[prefix] [prefix] ...',
        argsRequired: false,
      }
    );
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    if (
      !(await client.db.getGuildSettings(message.guildId ?? ''))?.prefixes &&
      !args[0]
    ) {
      return reply(message, {
        title: 'Prefixes',
        description: client.prefix.map((val) => `\`${val}\``).toString(),
      });
    }
    if (
      args[0] &&
      !message.member?.permissions.has(PermissionFlagsBits.ManageGuild)
    ) {
      return reply(message, {
        title: 'You need the `Manage Server` permission to change the prefixes',
        color: Colors.Red,
      });
    }
    if (!args[0]) {
      return reply(message, {
        title: 'Prefixes',
        description: (
          await client.db.getGuildSettings(message.guildId ?? '')
        )?.prefixes
          .map((val: string) => `\`${val}\``)
          .toString(),
      });
    }
    if (
      args[0] &&
      message.member?.permissions.has(PermissionFlagsBits.ManageGuild)
    ) {
      await client.db
        .setGuildSettings(message.guildId ?? '', {
          prefixes: args,
        })
        .then(console.log);

      return reply(message, {
        title: 'Successfully changed prefixes.',
        description: `Prefixes changed to: ${(
          await client.db.getGuildSettings(message.guildId ?? '')
        )?.prefixes?.map((val: string) => `\`${val}\``)}`,
        color: Colors.Green,
      });
    }
  }
}
