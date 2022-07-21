import type { Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class GithubCommand extends BaseCommand {
  constructor() {
    super('github', 'general', [], 5000, 'Shows this bots Github repo', {
      registerChatInput: true,
    });
  }

  override chatInputRun(
    client: BaseCommand.Client,
    interaction: BaseCommand.ChatInputCommandInteraction
  ) {
    interaction.reply({
      content: 'https://github.com/MajesticString/sniper',
      ephemeral: true,
    });
  }
  async run(client: DiscordClient, message: Message) {
    message.channel.send('https://github.com/MajesticString/sniper');
  }
}
