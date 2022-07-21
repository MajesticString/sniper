import { Colors, Message, PermissionsBitField, TextChannel } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class PollCommand extends BaseCommand {
  constructor() {
    super('poll', 'util', [], 10000, 'starts a poll idk', {
      argsDescription: '<the poll>',
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (!args[0]) {
      reply(message, {
        title: 'you must actually provide a poll lol',
        color: Colors.Red,
      });
      return;
    }
    reply(message, {
      title: args.join(' '),
    }).then(async (msg) => {
      if (
        (msg.channel as TextChannel)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .permissionsFor(message.guild!.members.me!)
          .has(PermissionsBitField.Flags.AddReactions)
      ) {
        await msg.react('👍');
        await msg.react('👎');
      }
    });
  }
}
