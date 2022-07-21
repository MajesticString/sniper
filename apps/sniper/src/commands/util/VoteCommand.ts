import {
  EmbedField,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class VoteCommand extends BaseCommand {
  constructor() {
    super(
      'vote2',
      'util',
      [],
      5000,
      'Gives options to vote for or something idk',
      {
        argsDescription: '<title> ...options separated by commas',
      }
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const options = args.join(' ').split(',').slice(1);
    options.map((option) => option.trim().replace(',', ''));

    if (options.length < 2) {
      message.channel.send('You need at least 2 options to vote');
      return;
    }
    if (options.length > 10) {
      message.channel.send('You can only have 10 options');
      return;
    }
    const fields: EmbedField[] = [];
    options.forEach((option, index) => {
      fields.push({
        name: `${index + 1}`,
        value: option.trim() === '' ? 'No option' : option,
        inline: true,
      });
    });
    reply(message, {
      title: args[0].substring(0, args[0].length - 1),
      fields,
    }).then(async (msg) => {
      // console.log(fields);
      if (
        (msg.channel as TextChannel)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .permissionsFor(message.guild!.members.me!)
          .has(PermissionFlagsBits.AddReactions)
      ) {
        await msg.react('1️⃣');
        await msg.react('2️⃣');
        if (fields.length >= 3) {
          await msg.react('3️⃣');
        }
        if (fields.length >= 4) {
          await msg.react('4️⃣');
        }
        if (fields.length >= 5) {
          await msg.react('5️⃣');
        }
        if (fields.length >= 6) {
          await msg.react('6️⃣');
        }
        if (fields.length >= 7) {
          await msg.react('7️⃣');
        }
        if (fields.length >= 8) {
          await msg.react('8️⃣');
        }
        if (fields.length >= 9) {
          await msg.react('9️⃣');
        }
        if (fields.length >= 10) {
          await msg.react('🔟');
        }
      }
    });
  }
}
