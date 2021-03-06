import type { Message, TextChannel } from 'discord.js';
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
      }
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (
      !message.member?.permissions.has('MANAGE_MESSAGES') &&
      message.author.id !== '696554549418262548'
    ) {
      reply(message, { title: 'you dont have the required perms' });
      return;
    }
    if (!message.guild?.me?.permissions.has('MANAGE_MESSAGES')) {
      reply(message, { title: 'I dont have the required perms', color: 'RED' });
      return;
    }
    if (!args[0]) {
      reply(message, {
        title: 'please specify the number of messages to clear.',
        color: 'RED',
      });
      return;
    }
    if (isNaN(parseInt(args[0]))) {
      reply(message, {
        title:
          'the amount of messages you want me to clear must be a valid number below 100',
        color: 'RED',
      });
      return;
    }
    if (parseInt(args[0]) > 100) {
      reply(message, {
        title: "I can't clear that many messages",
        description:
          "The discord api doesn't let me. Number of messages must be below 100.",
        color: 'RED',
      });
      return;
    }
    if (parseInt(args[0]) < 1) {
      reply(message, {
        title: 'I have to delete at least 1 message',
        color: 'RED',
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
            color: 'GREEN',
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
