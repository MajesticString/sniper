import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import type { CommandInteraction, Message } from 'discord.js';
import ms from 'ms';

@ApplyOptions<Command.Options>({
  aliases: ['ping', 'pong'],
  name: 'Ping',
  description: 'Pings the bot and returns response times.',
  cooldownDelay: ms('5s'),
})
export class PingCommand extends Command {
  public chatInputRun(message: CommandInteraction) {
    message
      .reply({
        embeds: [{ title: 'pinging....', color: Colors.Red }],
        fetchReply: true,
      })
      .then((msg) => {
        // const messageSendTime = Date.now();
        // let dbPing: number;
        // getUserData(message.author.id).then(() => {
        //   dbPing = Date.now();
        (msg as Message).edit({
          embeds: [
            {
              title: 'Pong!',
              description: 'these numbers do *not* represent lag.',
              color: Colors.Green,
              fields: [
                {
                  name: 'Latency',
                  value: `${ms(
                    (msg as Message).createdTimestamp - message.createdTimestamp
                  )}`,
                },
                {
                  name: 'API Latency',
                  value: `${this.container.client.ws.ping.toString()}ms`,
                },

                {
                  name: 'Uptime (how long since the last bot restart; affects `snipe` commands)',
                  value: `${ms(this.container.client.uptime ?? 0)}`,
                },
              ],
            },
          ],
        });
        // });
      });
  }
}
