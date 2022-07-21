import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { redBright } from 'colorette';
import type { Guild } from 'discord.js';
import { harrysDiscordID } from '../../index.js';

@ApplyOptions<Listener.Options>({ event: Events.GuildDelete })
export class GuildDelete extends Listener<typeof Events.GuildDelete> {
  async run(guild: Guild) {
    this.container.client.user?.setActivity({
      name: `$help in ${this.container.client.guilds.cache.size} servers`,
      type: 'WATCHING',
    });
    this.container.logger.info(
      redBright(
        `Left server ${guild.name}. Now in ${this.container.client.guilds.cache.size} guilds.`
      )
    );
    const owner = await guild
      .fetchOwner({ force: true })
      .catch(() => console.log('cant fetch guild owner'));

    this.container.client.users.cache.get(harrysDiscordID)?.send({
      content: `(-) Now in ${this.container.client.guilds.cache.size} guilds.`,
      embeds: [
        {
          title: 'Removed from Guild',
          description: [
            `**Guild Name:** ${guild.name}`,
            `**Guild ID:** ${guild.id}`,
            `**Guild Owner:** ${owner?.user.tag}`,
            `**Guild Member Count:** ${guild.members.memberCount?.toLocaleString()}`,
          ].join('\n'),
          image: {
            url:
              guild.iconURL({ dynamic: true, size: 1024 }) ??
              owner?.user.avatarURL({ dynamic: true, size: 1024 }) ??
              owner?.user.defaultAvatarURL,
          },
        },
      ],
    });
  }
}
