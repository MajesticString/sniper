import { Colors, Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { getRandomNumber } from '../../utils/helpers/randomNumber.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class CoinflipCommand extends BaseCommand {
  constructor() {
    super('coinflip', 'general', [], 500, 'Flips a coin', {
      argsRequired: false,
      argsDescription: '[heads or tails]',
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const chosen = getRandomNumber(0, 1) === 0 ? 'heads' : 'tails';
    const win = args[0].toLowerCase() === chosen;

    if (!args[0]) {
      await reply(message, {
        title: `You flipped a coin and got **${chosen}**!`,
      });
      return;
    } else {
      await reply(message, {
        title: `You ${win ? 'won' : 'lost'}!`,
        description: `You flipped a coin and got **${chosen}**!`,
        color: win ? Colors.Green : Colors.Red,
      });
      return;
    }
  }
}
