import { ApplyOptions, RequiresGuildContext } from '@sapphire/decorators';
import { ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { MessageEmbed, TextChannel } from 'discord.js';
import { editSnipes } from '../../lib/snipes.js';

@ApplyOptions<Command.Options>({
  name: 'editsnipe',
  description:
    'After a message is edited, you can use this command to see the old message.',
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
    const snipe = editSnipes[channel.id];
    if (!snipe)
      return interaction.reply({
        embeds: [
          {
            title: "There's nothing to snipe!",
            description:
              'Deleted messages can only be sniped within 1 hour of deletion.',
            color: Colors.Red,
          },
        ],
      });

    await interaction.reply({
      embeds: [
        snipe
          ? new MessageEmbed()
              .addField('Old message:', snipe.content ?? '')
              .addField(
                'New message:',
                `[Jump!](https://discord.com/channels/${interaction.guild?.id}/${channel.id}/${snipe.id})`
              )
              .setAuthor({ name: snipe.author?.tag ?? '' })
              .setColor('GREEN')
              .setFooter({
                text: `#${channel.name}`,
              })
              .setTimestamp(snipe.createdAt ? snipe.createdAt : 0)
          : new MessageEmbed()
              .setTitle("There's nothing to snipe!")
              .setColor('RED'),
      ],
    });
  }
}
