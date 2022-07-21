import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  Message,
  TextChannel,
} from 'discord.js';
import ms from 'ms';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import BaseCommand, {
  ApplicationCommandsRegistry,
} from '../../utils/structures/BaseCommand.js';
import { snipes, unSnipes } from './snipes.js';

export default class SnipeCommand extends BaseCommand {
  constructor() {
    super(
      'snipe',
      'util',
      [],
      3000,
      "After a message is deleted, this command shows what it was. If the creator of the deleted message doesn't want that message to be shown, they can use the `unsnipe` command.",
      {
        argsRequired: false,
        argsDescription: '[type: embeds | attachments | messages]',
      }
    );
  }

  registerApplicationCommands(
    client: DiscordClient,
    registry: ApplicationCommandsRegistry
  ) {
    registry.registerChatInputCommand((b) =>
      b
        .setName(this.name)
        .setDescription('Shows the last deleted message of a channel.')
        .addStringOption((i) =>
          i
            .setName('type')
            .setDescription('The type of message to recover')
            .setRequired(false)
            .setChoices(
              { name: 'Embeds', value: 'embeds' },
              { name: 'Messages', value: 'messages' },
              { name: 'Attachments', value: 'attachments' }
            )
        )
    );
  }

  async chatInputRun(
    client: DiscordClient,
    interaction: CommandInteraction,
    overrideType?: string
  ): Promise<unknown> {
    let type =
      overrideType ??
      interaction.options.get('type', false)?.value ??
      'messages';
    const snipe = snipes[interaction.channelId];

    if (!snipe)
      return reply(interaction, {
        title: "There's nothing to snipe!",
        description:
          client.uptime && client.uptime < ms('1m')
            ? 'The bot was just restarted less than a minute ago. All snipes are wiped after every restart.'
            : 'Deleted messages can only be sniped within 1 hour of deletion.',
        color: Colors.Red,
      });

    snipes[interaction.channelId] = {
      ...snipes[interaction.channelId],
      requesterId: interaction.user.id,
      cmdId: interaction.id,
    };

    if (
      !snipe.content &&
      snipe.embeds &&
      Array.isArray(snipe.embeds) &&
      snipe.embeds[0]
    )
      type = 'embeds';

    if (!snipe.content && !snipe.embeds?.length && snipe.attachments)
      type = 'attachments';

    if (type === 'messages') {
      if (!snipe.content && snipe.embeds?.length) {
        return reply(interaction, {
          title:
            "This message didn't have any content, but it did have an embed. Trying this command again with the `embeds` type....",
        }).then(() => this.chatInputRun(client, interaction, 'embeds'));
      }
      await reply(
        interaction,
        snipe
          ? new EmbedBuilder()
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
              .setColor(Colors.Green)
              .setFooter({
                text: `#${
                  (interaction.channel as TextChannel).name
                } | If the original author or the person who requested this snipe wants to remove this message, they can use the \`unsnipe\` command.`,
              })
              .setTimestamp(snipe?.createdAt ? snipe.createdAt : 0)
          : {
              title: "There's nothing to snipe!",
              description:
                'Deleted messages can only be sniped within 1 hour of deletion.',
              color: Colors.Red,
            },

        // snipe?.message?.attachments.first()
        //   ? {
        //       attachments: snipe.message.attachments.toJSON(),
        //     }
        //   :
        {}
      ).then((msg) => {
        unSnipes[interaction.channelId] = {
          msg,
        };
      });
    } else if (type === 'embeds') {
      if (snipe.embeds?.length === 0)
        return reply(interaction, {
          title:
            "This message doesn't have any embeds! Trying this command again with the `messages` type....",
          color: Colors.Red,
        }).then(() => this.chatInputRun(client, interaction, 'messages'));
      const paginator = new PaginatedMessage();
      paginator.addPageEmbeds(
        snipe.embeds ?? [new EmbedBuilder().setTitle('No embeds')]
      );
      const unSnipe = await paginator.run(interaction);
      unSnipes[interaction.channelId] = {
        msg: unSnipe.response as Message,
      };
    } else if (type === 'attachments') {
      if (!snipe.attachments?.length)
        return reply(interaction, {
          title:
            "This message doesn't have any attachments. Trying this command again with the `embeds` type....",
          color: Colors.Red,
        }).then(() => this.chatInputRun(client, interaction, 'embeds'));
      const paginator = new PaginatedMessage();
      paginator.addPages(snipe.attachments.map((a) => ({ content: a })));
      const unSnipe = await paginator.run(interaction);
      unSnipes[interaction.channelId] = {
        msg: unSnipe.response as Message,
      };
    }
  }

  async run(
    client: DiscordClient,
    message: Message,
    args: string[]
  ): Promise<any> {
    type SnipeType = 'messages' | 'embeds' | 'attachments';
    let type: SnipeType = 'messages';
    if (args[0] && /^(embeds|attachments|messages)$/i.test(args[0]))
      // we know that its the same because of the regex test.
      type = args[0] as SnipeType;

    const snipe = snipes[message.channelId];
    if (!snipe)
      return reply(message, {
        title: "There's nothing to snipe!",
        description:
          client.uptime && client.uptime < ms('1m')
            ? 'The bot was just restarted less than a minute ago. All snipes are wiped after every restart.'
            : 'Deleted messages can only be sniped within 1 hour of deletion.',
        color: Colors.Red,
      });

    snipes[message.channelId] = {
      ...snipes[message.channelId],
      requesterId: message.author.id,
      cmdId: message.id,
    };

    if (
      !snipe.content &&
      snipe.embeds &&
      Array.isArray(snipe.embeds) &&
      snipe.embeds[0] &&
      !args[0]
    )
      type = 'embeds';

    if (
      !snipe.content &&
      !snipe.embeds?.length &&
      snipe.attachments &&
      !args[0]
    )
      type = 'attachments';

    if (type === 'messages') {
      if (!snipe.content && snipe.embeds?.length) {
        return reply(message, {
          title:
            "This message didn't have any content, but it did have an embed. Trying this command again with the `embeds` type....",
        }).then(() => this.run(client, message, ['embeds']));
      }
      await reply(
        message,
        snipe
          ? new EmbedBuilder()
              .setDescription(
                `${
                  message.author.bot
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
              .setColor(Colors.Green)
              .setFooter({
                text: `#${
                  (message.channel as TextChannel).name
                } | If the original author or the person who requested this snipe wants to remove this message, they can use the \`unsnipe\` command.`,
              })
              .setTimestamp(snipe?.createdAt ? snipe.createdAt : 0)
          : {
              title: "There's nothing to snipe!",
              description:
                'Deleted messages can only be sniped within 1 hour of deletion.',
              color: Colors.Red,
            },

        // snipe?.message?.attachments.first()
        //   ? {
        //       attachments: snipe.message.attachments.toJSON(),
        //     }
        //   :
        {}
      ).then((msg) => {
        unSnipes[message.channel.id] = {
          msg,
        };
      });
    } else if (type === 'embeds') {
      if (snipe.embeds?.length === 0)
        return reply(message, {
          title:
            "This message doesn't have any embeds! Trying this command again with the `messages` type....",
          color: Colors.Red,
        }).then(() => this.run(client, message, ['messages']));
      const paginator = new PaginatedMessage();
      paginator.addPageEmbeds(
        snipe.embeds ?? [new EmbedBuilder().setTitle('No embeds')]
      );
      const unSnipe = await paginator.run(message);
      unSnipes[message.channelId] = {
        msg: unSnipe.response as Message,
      };
    } else if (type === 'attachments') {
      if (!snipe.attachments?.length)
        return reply(message, {
          title:
            "This message doesn't have any attachments. Trying this command again with the `embeds` type....",
          color: Colors.Red,
        }).then(() => this.run(client, message, ['embeds']));
      const paginator = new PaginatedMessage();
      paginator.addPages(snipe.attachments.map((a) => ({ content: a })));
      const unSnipe = await paginator.run(message);
      unSnipes[message.channel.id] = {
        msg: unSnipe.response as Message,
      };
    }
  }
}
