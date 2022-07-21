import { snipes, unSnipes } from '#lib/snipes.js';
import { ApplyOptions, RequiresGuildContext } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import {
  ApplicationCommandRegistry,
  Command,
  RegisterBehavior,
} from '@sapphire/framework';
import { Message, MessageEmbed, TextChannel } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'snipe',
  detailedDescription:
    "After a message is deleted, this command shows what it was. If the creator of the deleted message doesn't want that message to be shown, they can use the `unsnipe` command.",
  description: 'Shows the last deleted message of this channel.',
  cooldownDelay: 3000,
  runIn: ['GUILD_ANY'],
})
export class SnipeCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((i) =>
            i
              .setName('type')
              .setDescription(
                'The type of message to be sniped. Default: messages'
              )
              .setChoices(
                { name: 'messages', value: 'messages' },
                { name: 'embeds', value: 'embeds' },
                { name: 'attachments', value: 'attachments' }
              )
              .setRequired(false)
          ),
      {
        idHints: ['978089005189038122'],
        behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
      }
    );
  }

  @RequiresGuildContext()
  public async chatInputRun(interaction: Command.ChatInputInteraction) {
    const channel = <TextChannel>interaction.channel;
    const rawType = <SnipeType | undefined>(
      interaction.options.getString('type', false)
    );
    type SnipeType = 'messages' | 'embeds' | 'attachments';
    let type: SnipeType = rawType ?? 'messages';

    const snipe = snipes[interaction.channelId];
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

    if (
      !snipe.content &&
      snipe.embeds &&
      Array.isArray(snipe.embeds) &&
      snipe.embeds[0] &&
      !rawType
    )
      type = 'embeds';

    if (
      !snipe.content &&
      !snipe.embeds?.length &&
      snipe.attachments &&
      !rawType
    )
      type = 'attachments';

    if (type === 'messages') {
      if (!snipe.content && snipe.embeds?.length) {
        return interaction.reply({
          embeds: [
            {
              title:
                "This message didn't have any content, but it did have an embed. Try this command again with the `embeds` type.",
            },
          ],
          ephemeral: true,
        });
      }
      await interaction
        .reply({
          fetchReply: true,
          embeds: [
            snipe
              ? new MessageEmbed()
                  .setDescription(
                    `${
                      interaction.user.bot
                        ? "(if there is nothing here, the message was probably an embed and i can't send embeds in embeds)\n"
                        : ''
                    }${snipe.content}${
                      snipe.attachments?.length
                        ? `\n\nAttachment(s): ${snipe.attachments
                            .map((val) => ` ${val} `)
                            .toString()}`
                        : ``
                    }`
                  )
                  .setAuthor({ name: snipe.author?.tag ?? '' })
                  .setColor('GREEN')
                  .setFooter({
                    text: `#${channel.name} | If the original author wants to remove this message, they can use the \`unsnipe\` command.`,
                  })
                  .setTimestamp(snipe?.createdAt ? snipe.createdAt : 0)
              : {
                  title: "There's nothing to snipe!",
                  description:
                    'Deleted messages can only be sniped within 1 hour of deletion.',
                  color: Colors.Red,
                },
          ],
        })
        .then((msg) => {
          unSnipes[channel.id] = {
            msg: <Message>msg,
          };
        });
    } else if (type === 'embeds') {
      if (snipe.embeds?.length === 0)
        return interaction.reply({
          embeds: [
            {
              title:
                "This message doesn't have any embeds! Try this command again with the `messages` type.",
              color: Colors.Red,
            },
          ],
        });
      const paginator = new PaginatedMessage();
      paginator.addPageEmbeds(
        snipe.embeds ?? [new MessageEmbed().setTitle('No embeds')]
      );
      const unSnipe = await paginator.run(interaction);
      unSnipes[interaction.channelId] = {
        msg: unSnipe.response as Message,
      };
    } else if (type === 'attachments') {
      if (!snipe.attachments?.length)
        return interaction.reply({
          embeds: [
            {
              title:
                "This message doesn't have any attachments. Try this command again with the `embeds` type.",
              color: Colors.Red,
            },
          ],
        });
      const paginator = new PaginatedMessage();
      paginator.addPages(snipe.attachments.map((a) => ({ content: a })));
      const unSnipe = await paginator.run(interaction);
      unSnipes[channel.id] = {
        msg: unSnipe.response as Message,
      };
    }
  }
}
