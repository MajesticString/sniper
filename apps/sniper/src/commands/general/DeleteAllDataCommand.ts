import { Colors, Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { db } from '../../sniper.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class DeleteAllDataCommand extends BaseCommand {
  constructor() {
    super(
      'deletealldata',
      'general',
      ['deletemydata'],
      500,
      'Deletes all data associated with the bot. The only thing that will remain is your user ID.',
      {
        argsRequired: false,
      }
    );
  }

  async run(client: DiscordClient, message: Message) {
    let responded = false;
    await reply(message, {
      title: 'Are you sure you want to delete all of your data?',
      description:
        'This means all coins, xp and settings. This cannot be undone. Type "DELETE ALL DATA" to confirm (not case sensitive). Type literally anything else to cancel.',
      color: Colors.Yellow,
    });
    message.channel
      .createMessageCollector({
        filter: (m) => m.author.id === message.author.id && !responded,

        time: 10000,
      })
      .on('collect', async (msg) => {
        if (msg.content.toLowerCase() === 'delete all data') {
          await db.collection('users').doc(message.author.id).delete();
          reply(message, { title: 'All data deleted.' });
          responded = true;
          return;
        } else {
          reply(message, { title: 'Canceled.' });
          responded = true;
          return;
        }
      })
      .on('end', async () => {
        if (!responded)
          reply(message, {
            title: 'Canceled because you took too long to respond.',
          });
        return;
      });
  }
}
