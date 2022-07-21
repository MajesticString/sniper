import { redBright } from 'colorette';
import { ActivityType, Guild } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { harrysDiscordID } from '../../sniper.js';
import { log } from '../../utils/helpers/console.js';
import { BaseEvent } from '../../utils/structures/BaseEvent.js';

export default class GuildDeleteEvent extends BaseEvent {
  constructor() {
    super('guildDelete');
  }

  async run(client: DiscordClient, guild: Guild) {
    client.user?.setActivity({
      name: `$help in ${client.guilds.cache.size} servers`,
      type: ActivityType.Watching,
    });
    log(
      redBright(
        `Left server ${guild.name}. Now in ${client.guilds.cache.size} guilds.`
      )
    );
    const owner = await guild
      .fetchOwner({ force: true })
      .catch(() => console.log('cant fetch guild owner'));

    client.users.cache.get(harrysDiscordID)?.send({
      content: `(-) Now in ${client.guilds.cache.size} guilds.`,
      embeds: [
        {
          title: 'Removed from Guild',
          description: [
            `**Guild Name:** ${guild.name}`,
            `**Guild ID:** ${guild.id}`,
            `**Guild Owner:** ${owner?.user.tag}`,
            `**Guild Member Count:** ${guild.memberCount?.toLocaleString()}`,
          ].join('\n'),
          image: {
            url:
              guild.iconURL({ size: 1024 }) ??
              owner?.user.avatarURL({ size: 1024 }) ??
              owner?.user.defaultAvatarURL ??
              'https://wompampsupport.azureedge.net/fetchimage?siteId=7575&v=2&jpgQuality=100&width=700&url=https%3A%2F%2Fi.kym-cdn.com%2Fentries%2Ficons%2Fmobile%2F000%2F039%2F022%2Fddddd.jpg',
          },
        },
      ],
    });
  }
}
