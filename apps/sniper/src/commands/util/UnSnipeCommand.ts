import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  ComponentType,
  ContextMenuCommandInteraction,
  MessageActionRowComponentBuilder,
  PermissionFlagsBits,
  type Message,
  type TextChannel,
} from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';
import { snipes, unSnipes } from './snipes.js';

export default class UnSnipeCommand extends BaseCommand {
  constructor() {
    super(
      'unsnipe',
      'util',
      [],
      1000,
      'The author of the sniped message can delete the snipe with this command.',
      {
        tip: `You can also use this command by context menus. Right click/long press the message, click apps, and click \`unsnipe\`.

This has the added effect of allowing the original \`snipe\` command to be deleted.`,
      }
    );
  }

  async run(client: DiscordClient, message: Message) {
    const snipe = unSnipes[message.channelId]?.msg;
    if (!snipe) {
      reply(message, {
        title:
          'This snipe does not exist. This usually happens after a bot restart.',
        color: Colors.Red,
      });
      return;
    }
    const msgToDelete = message.channel?.messages.cache.get(snipe?.id);
    if (
      msgToDelete &&
      snipe &&
      (message.author.id === snipes[message.channel.id].author?.id ||
        message.author.id === snipes[message.channel.id].requesterId)
    ) {
      await msgToDelete.delete();
      delete snipes[message.channel.id];
    }
  }

  override async contextMenuRun(
    client: DiscordClient,
    interaction: ContextMenuCommandInteraction
  ) {
    if (interaction.isMessageContextMenuCommand()) {
      if (interaction.targetMessage.author.id !== client.user?.id)
        return interaction.reply({
          embeds: [
            {
              title: "This command must be used on one of Sniper's messages.",
              color: Colors.Red,
            },
          ],
          ephemeral: true,
        });
      const snipe = unSnipes[interaction.channelId]?.msg;
      if (!snipe) {
        interaction.reply({
          embeds: [
            {
              title:
                'This snipe does not exist. This usually happens after a bot restart.',
              color: Colors.Red,
            },
          ],
          ephemeral: true,
        });
        return;
      }
      const msgToDelete = interaction.channel?.messages.cache.get(snipe?.id);
      if (
        msgToDelete &&
        snipe &&
        (interaction.user.id === snipes[interaction.channelId].author?.id ||
          interaction.user.id === snipes[interaction.channelId].requesterId)
      ) {
        await msgToDelete.delete();
        const originalCmd = await interaction.channel?.messages.fetch(
          snipes[interaction.channelId]?.cmdId
        );
        delete snipes[interaction.channelId];

        if (
          (<TextChannel>interaction.channel)
            // eslint-disable-next-line -- it exists
            .permissionsFor(interaction.guild!.members.me!)
            .has(PermissionFlagsBits.ManageMessages)
        ) {
          const msg = <Message>await interaction.reply({
            embeds: [
              {
                title: 'Snipe deleted.',
                description:
                  'Would you like to also delete the original command?',
              },
            ],
            ephemeral: true,
            fetchReply: true,
            components: [
              new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Primary)
                  .setLabel('Yes')
                  .setCustomId('yes')
              ),
            ],
          });
          const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
          });
          collector.on('collect', (c) => {
            if (c.customId === 'yes') {
              originalCmd
                ?.delete()
                .catch(() =>
                  c.reply({
                    content: 'Error deleting command',
                    ephemeral: true,
                  })
                )
                .then(() => {
                  c.reply({
                    content: 'Command deleted.',
                    ephemeral: true,
                  });
                });
            }
          });
        } else
          return interaction.reply({
            embeds: [
              {
                title: 'Deleted Snipe',
                description:
                  'Could not delete original command because of missing permissions.',
              },
            ],
            ephemeral: true,
          });
      }
    }
  }
}
