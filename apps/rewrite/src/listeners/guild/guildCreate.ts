import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { green } from 'colorette';
import { Guild, MessageActionRow, MessageButton } from 'discord.js';
import { harrysDiscordID } from '../../index.js';

@ApplyOptions<Listener.Options>({
  event: Events.GuildCreate,
})
export class GuildCreate extends Listener<typeof Events.GuildCreate> {
  async run(guild: Guild) {
    this.container.client.user?.setActivity({
      name: `$help in ${this.container.client.guilds.cache.size} servers`,
      type: 'WATCHING',
    });
    const owner = await guild.fetchOwner({ force: true });

    this.container.client.users.cache.get(harrysDiscordID)?.send({
      content: `(+) Now in ${this.container.client.guilds.cache.size} guilds.`,
      embeds: [
        {
          title: 'Added to Guild',
          description: [
            `**Guild Name:** ${guild.name}`,
            `**Guild ID:** ${guild.id}`,
            `**Guild Owner:** ${owner.user.tag} `,
            `**Guild Member Count:** ${guild.members.memberCount.toLocaleString()}`,
          ].join('\n'),
          image: {
            url:
              guild.iconURL({ dynamic: true, size: 1024 }) ??
              owner.user.avatarURL({ dynamic: true, size: 1024 }) ??
              owner.user.defaultAvatarURL,
          },
        },
      ],
    });
    this.container.logger.info(
      green(
        `Joined guild ${guild.name}. Now in ${this.container.client.guilds.cache.size} guilds.`
      )
    );
    if (
      guild.systemChannel &&
      guild.members.me?.permissions.has('SEND_MESSAGES') &&
      guild.members.me?.permissions.has('VIEW_CHANNEL') &&
      guild.systemChannel
        ?.permissionsFor(guild.members.me)
        .has('SEND_MESSAGES') &&
      guild.systemChannel?.permissionsFor(guild.members.me).has('VIEW_CHANNEL')
    ) {
      const msg = await guild.systemChannel?.send({
        embeds: [
          {
            title: 'Hello, I am Sniper',
            description:
              'A general purpose Discord bot. Includes snipe, edit snipe, and reaction snipe commands.',
            color: 'RANDOM',
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
          new MessageActionRow().addComponents(
            new MessageButton()
              .setEmoji('❌')
              .setCustomId('remove')
              .setStyle('PRIMARY')
          ),
        ],
      });
      msg
        .createMessageComponentCollector({ componentType: 'BUTTON' })
        .on('collect', (i) => {
          i.deferUpdate();
          if (!i.memberPermissions?.has('MANAGE_MESSAGES'))
            i.reply({
              content:
                'You cannot delete this messages since you dont have the manage messages permission.',
              ephemeral: true,
            });
          else {
            msg.delete();
          }
        });
    }
  }
}
