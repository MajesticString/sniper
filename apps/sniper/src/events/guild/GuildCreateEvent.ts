import { green } from 'colorette';
import {
  ActionRowBuilder,
  ActivityType,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  ComponentType,
  MessageActionRowComponentBuilder,
  PermissionFlagsBits,
  type Guild,
} from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { harrysDiscordID } from '../../sniper.js';
import { log } from '../../utils/helpers/console.js';
import { BaseEvent } from '../../utils/structures/BaseEvent.js';

export default class GuildCreateEvent extends BaseEvent {
  constructor() {
    super('guildCreate');
  }

  async run(client: DiscordClient, guild: Guild) {
    client.user?.setActivity({
      name: `$help in ${client.guilds.cache.size} servers`,
      type: ActivityType.Watching,
    });
    const owner = await guild.fetchOwner({ force: true });

    client.users.cache.get(harrysDiscordID)?.send({
      content: `(+) Now in ${client.guilds.cache.size} guilds.`,
      embeds: [
        {
          title: 'Added to Guild',
          description: [
            `**Guild Name:** ${guild.name}`,
            `**Guild ID:** ${guild.id}`,
            `**Guild Owner:** ${owner.user.tag} `,
            `**Guild Member Count:** ${guild.memberCount.toLocaleString()}`,
          ].join('\n'),
          image: {
            url:
              guild.iconURL({ size: 1024 }) ??
              owner.user.avatarURL({ size: 1024 }) ??
              owner.user.defaultAvatarURL,
          },
        },
      ],
    });
    log(
      green(
        `Joined guild ${guild.name}. Now in ${client.guilds.cache.size} guilds.`
      )
    );
    if (
      guild.systemChannel &&
      guild.members.me?.permissions.has(PermissionFlagsBits.SendMessages) &&
      guild.members.me?.permissions.has(PermissionFlagsBits.ViewChannel) &&
      guild.systemChannel
        ?.permissionsFor(guild.members.me)
        .has(PermissionFlagsBits.SendMessages) &&
      guild.systemChannel
        ?.permissionsFor(guild.members.me)
        .has(PermissionFlagsBits.ViewChannel)
    ) {
      const msg = await guild.systemChannel?.send({
        embeds: [
          {
            title: 'Hello, I am Sniper',
            description:
              'A general purpose Discord bot. Includes snipe, edit snipe, and reaction snipe commands.',
            color: Colors.White,
            fields: [
              {
                name: 'Prefix:',
                value: '`$` or `%`',
              },
              {
                name: 'Help Command:',
                value: '`$help` or `%help`',
              },
            ],
          },
        ],
        components: [
          new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new ButtonBuilder()
              .setLabel('Remove')
              .setCustomId('remove')
              .setStyle(ButtonStyle.Primary)
          ),
        ],
      });
      msg
        .createMessageComponentCollector({
          componentType: ComponentType.Button,
        })
        .on('collect', (i) => {
          i.deferUpdate();
          if (!i.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
            i.reply({
              content:
                'You cannot delete this messages since you dont have the manage messages permission.',
              ephemeral: true,
            });
            return;
          } else {
            msg.delete();
          }
        });
    }
  }
}
