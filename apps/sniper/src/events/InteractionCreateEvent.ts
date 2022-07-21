import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
  type GuildMemberRoleManager,
  type Interaction,
  type TextChannel,
} from 'discord.js';
import type { DiscordClient } from '../client/client.js';
import { BaseEvent } from '../utils/structures/BaseEvent.js';

export default class InteractionCreateEvent extends BaseEvent {
  constructor() {
    super('interactionCreate');
  }

  async run(client: DiscordClient, interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      console.log('slash command ' + interaction.commandName);
      client.commands.get(interaction.commandName)?.chatInputRun &&
        // @ts-ignore
        client.commands
          .get(interaction.commandName)
          ?.chatInputRun(client, interaction);
    } else if (interaction.isContextMenuCommand()) {
      client.commands.get(interaction.commandName)?.contextMenuRun &&
        // @ts-ignore
        client.commands
          .get(interaction.commandName)
          ?.contextMenuRun(client, interaction);
    } else if (interaction.isButton()) {
      if (
        interaction.customId === 'pingRole' &&
        interaction.guildId === '882695828140073052'
      ) {
        if (
          (<GuildMemberRoleManager>interaction.member?.roles).cache.has(
            '966129132566093955'
          )
        ) {
          await (<GuildMemberRoleManager>interaction.member?.roles).remove(
            '966129132566093955'
          );
          await interaction.reply({
            content: 'Removed role `Random shit ping`',
            ephemeral: true,
          });
        } else {
          await (<GuildMemberRoleManager>interaction.member?.roles).add(
            '966129132566093955'
          );
          await interaction.reply({
            content: 'Added role `Random shit ping`',
            ephemeral: true,
          });
        }
        await (
          client.channels.cache.get('888555667248521216') as TextChannel
        ).messages.cache
          .get('966129049720213525')
          ?.edit({
            embeds: [
              {
                title: 'Random shit ping',
                description:
                  "Anyone can ping this role for whatever reason... it's random.",
                footer: {
                  text: `${
                    interaction.guild?.roles.cache.get('966129132566093955')
                      ?.members.size
                  } members have this role`,
                },
              },
            ],
            components: [
              new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new ButtonBuilder()
                  .setCustomId('pingRole')
                  .setStyle(ButtonStyle.Primary)
                  .setLabel('Add/remove role')
              ),
            ],
          });
      }
    }
  }
}
