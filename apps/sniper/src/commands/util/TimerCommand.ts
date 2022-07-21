import { Colors, Message } from 'discord.js';
import { DateTime, Duration } from 'luxon';
import ms from 'ms';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class TimerCommand extends BaseCommand {
  constructor() {
    super(
      'timer',
      'util',
      [],
      ms('1m'),
      'Sets a timer. Updates every 5 seconds.',

      {
        argsDescription:
          '<timer length><unit (short or long)> [timer description]',
      }
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const msRegex =
      /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i;

    let time: number;
    let descriptionArgStart = 1;

    if (isNaN(Number(args[0]))) {
      if (msRegex.test(args[0])) time = ms(args[0]);
      else return reply(message, { title: 'Invalid time.', color: Colors.Red });
    } else if (msRegex.test(args[0] + args[1])) {
      time = ms(args[0] + args[1]);
      descriptionArgStart = 2;
    } else time = ms(args[0] + 'm');

    if (time >= Number.MAX_SAFE_INTEGER || time > ms('596h'))
      return reply(message, {
        title: `The time must not exceed ${ms(Number.MAX_SAFE_INTEGER, {
          long: true,
        })}`,
        color: Colors.Red,
      });
    if (time <= 0)
      return reply(message, {
        title: 'The time must be positive.',
        color: Colors.Red,
      });

    const staticTime = time;

    const endTime = DateTime.now()
      .setZone('America/Los_Angeles')
      .plus(Duration.fromDurationLike(time))
      .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);
    const msg = await reply(message, {
      title: args[descriptionArgStart]
        ? `(${ms(time)}) ` + args.slice(descriptionArgStart).join(' ')
        : 'Timer',
      description: `${ms(time, { long: true })}`,
      color: Colors.Green,
      footer: {
        text: `Timer for ${ms(staticTime, {
          long: true,
        })}. Ends at ${endTime} PST`,
      },
    });
    msg;
    let firstTime = true;

    const interval = setInterval(() => {
      msg.edit({
        embeds: [
          {
            title: args[descriptionArgStart]
              ? `(${ms(time)}) ` + args.slice(descriptionArgStart).join(' ')
              : 'Timer',
            description: `${ms(time, { long: true })}`,
            color: time > 0 ? Colors.Green : Colors.Red,
            footer: {
              text: `Timer for ${ms(staticTime, {
                long: true,
              })}. Ends at ${endTime} PST`,
            },
          },
        ],
      });
      time -= firstTime ? 10000 : 5000;
      firstTime = false;
    }, ms('5 seconds'));
    interval;
    setTimeout(() => {
      clearInterval(interval);
      msg.edit({
        embeds: [
          {
            title: args[descriptionArgStart]
              ? `(${ms(time)}) ` + args.slice(descriptionArgStart).join(' ')
              : 'Timer',
            description: `Timer has ended`,
            color: Colors.Red,
            footer: {
              text: `Timer for ${ms(staticTime, {
                long: true,
              })}. Ended at ${endTime} PST`,
            },
          },
        ],
      });
      msg.reply(`${message.author.toString()} Your timer has ended.`);
    }, time);
  }
}
