import type { Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class InviteCommand extends BaseCommand {
  constructor() {
    super('invite', 'general', [], 1000, 'Gives an invite link for this bot');
  }

  async run(client: DiscordClient, message: Message) {
    message.channel.send('https://sniper.pages.dev/invite/');
  }
}
