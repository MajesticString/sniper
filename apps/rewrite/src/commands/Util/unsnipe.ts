import { snipes, unSnipes } from '#lib/snipes.js';
import { ApplyOptions, RequiresGuildContext } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'unsnipe',
  cooldownDelay: 1000,
  description:
    'The author of the sniped message can delete the snipe with this command.',
})
export class UserCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description)
    );
  }

  @RequiresGuildContext((i) => {
    i.reply('This command can only be used in a guild.');
  })
  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    const channel = interaction.channel as TextChannel;
    const snipe = unSnipes[interaction.channelId]?.msg;
    if (!snipe) {
      return interaction.reply({
        embeds: [
          {
            title:
              'This snipe does not exist. This usually happens after a bot restart.',
            color: Colors.Red,
          },
        ],
      });
    }
    const msgToDelete = interaction.channel?.messages.cache.get(snipe?.id);
    if (
      msgToDelete &&
      snipe &&
      (interaction.user.id === snipes[channel.id].user?.id ||
        interaction.user.id === snipes[channel.id].requesterId)
    ) {
      await msgToDelete.delete();
      delete snipes[channel.id];
    }
  }
}
