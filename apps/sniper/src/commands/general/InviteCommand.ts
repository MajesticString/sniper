import type { Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class InviteCommand extends BaseCommand {
  constructor() {
    super('invite', 'general', [], 1000, 'Gives an invite link for this bot');
  }

  async registerApplicationCommands(
    client: BaseCommand.Client,
    registry: BaseCommand.CommandsRegistry
  ) {
    registry.registerChatInputCommand((b) =>
      b.setName(this.name).setDescription(this.description)
    );
  }

  async chatInputRun(
    client: BaseCommand.Client,
    interaction: BaseCommand.ChatInputCommandInteraction
  ) {
    interaction.reply('https://sniper.pages.dev/invite.html');
  }

  async run(client: DiscordClient, message: Message) {
    message.channel.send('https://sniper.pages.dev/invite.html');
  }
}
