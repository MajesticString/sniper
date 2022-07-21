import { exec } from 'child_process';
import { Colors, CommandInteraction, EmbedBuilder, Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { goodServers } from '../../sniper.js';
import { ConfirmationMessage } from '../../utils/helpers/interactions.js';
import BaseCommand, {
  ApplicationCommandsRegistry,
} from '../../utils/structures/BaseCommand.js';

export default class RestartCommand extends BaseCommand {
  constructor() {
    super('fullupdate', 'restricted', [], 5000, 'Updates sniper and VM deps');
  }
  registerApplicationCommands(
    client: DiscordClient,
    registry: ApplicationCommandsRegistry
  ) {
    registry.registerChatInputCommand(
      (b) => b.setName(this.name).setDescription(this.description),
      goodServers
    );
  }
  chatInputRun(client: DiscordClient, interaction: CommandInteraction) {
    this.run(client, interaction);
  }
  async run(client: DiscordClient, message: Message | CommandInteraction) {
    new ConfirmationMessage(
      message,
      new EmbedBuilder()
        .setTitle('Are you sure you want to update Sniper?')
        .setDescription('This will also restart the VM')
        .setColor(Colors.Green)
    ).on('confirm', (i) => {
      i.reply('updating sniper....');
      exec(
        'rm ../../pnpm-lock.yaml && git pull && pnpm i && npm run build && sudo apt update && sudo apt upgrade -y && sudo reboot'
      );
    });
  }
}
