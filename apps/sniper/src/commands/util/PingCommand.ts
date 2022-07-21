import { Colors, Message } from 'discord.js';
import ms from 'ms';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { getUserData } from '../../utils/helpers/user.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class PingCommand extends BaseCommand {
  constructor() {
    super(
      'ping',
      'util',
      [],
      ms('5s'),
      'Pings the bot and returns response times.'
    );
  }

  async run(client: DiscordClient, message: Message) {
    reply(message, { title: 'pinging....', color: Colors.Red }).then((msg) => {
      const messageSendTime = Date.now();
      let dbPing: number;
      getUserData(message.author.id).then(() => {
        dbPing = Date.now();
        msg.edit({
          embeds: [
            {
              title: 'Pong!',
              description: 'these numbers do *not* represent lag.',
              color: Colors.Green,
              fields: [
                {
                  name: 'Latency',
                  value: `${ms(
                    msg.createdTimestamp - message.createdTimestamp
                  )}`,
                },
                {
                  name: 'API Latency',
                  value: `${client.ws.ping.toString()}ms`,
                },
                {
                  name: 'Database latency (affects currency commands)',
                  value: `${(dbPing - messageSendTime).toString()}ms`,
                },
                {
                  name: 'Uptime (how long since the last bot restart; affects `snipe` commands)',
                  value: `${ms(client.uptime ?? 0)}`,
                },
              ],
            },
          ],
        });
      });
    });
  }
}
