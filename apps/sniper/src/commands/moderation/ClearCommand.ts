import { Colors, Message, PermissionFlagsBits, TextChannel } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class ClearCommand extends BaseCommand {
  constructor() {
    super(
      'clear',
      'moderation',
      ['purge'],
      0,
      'Clears messages from a channel',
      {
        argsDescription: '<# of messages to clear>',
        permissions: ['ManageMessages'],
      }
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (
      !message.member?.permissions.has(PermissionFlagsBits.ManageMessages) &&
      message.author.id !== '696554549418262548'
    ) {
      reply(message, { title: 'you dont have the required perms' });
      return;
    }
    if (
      !message.guild?.members.me?.permissions.has(
        PermissionFlagsBits.ManageMessages
      )
    ) {
      reply(message, {
        title: 'I dont have the required perms',
        color: Colors.Red,
      });
      return;
    }
    if (!args[0]) {
      reply(message, {
        title: 'please specify the number of messages to clear.',
        color: Colors.Red,
      });
      return;
    }
    if (isNaN(parseInt(args[0]))) {
      reply(message, {
        title:
          'the amount of messages you want me to clear must be a valid number below 100',
        color: Colors.Red,
      });
      return;
    }
    if (parseInt(args[0]) > 100) {
      reply(message, {
        title: "I can't clear that many messages",
        description:
          "The discord api doesn't let me. Number of messages must be below 100.",
        color: Colors.Red,
      });
      return;
    }
    if (parseInt(args[0]) < 1) {
      reply(message, {
        title: 'I have to delete at least 1 message',
        color: Colors.Red,
      });
      return;
    }

    await (message.channel as TextChannel).bulkDelete(parseInt(args[0]) + 1);
    message.channel
      .send({
        embeds: [
          {
            title: `Deleted ${args[0]} + 1 message.`,
            description:
              'Why +1? because you sent a command. that needs to be deleted.',
            color: Colors.Green,
          },
        ],
      })
      .then((message) =>
        setTimeout(() => {
          message.delete();
        }, 5000)
      );
  }
}
