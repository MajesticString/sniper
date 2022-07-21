import { AuditLogEvent, Colors, GuildBan, User } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { sendMessageInBorderSecurity } from '../../utils/helpers/cambridge-server.js';
import { BaseEvent } from '../../utils/structures/BaseEvent.js';

export default class GuildBanAddEvent extends BaseEvent {
  constructor() {
    super('guildBanAdd');
  }

  async run(client: DiscordClient, ban: GuildBan) {
    if (ban.guild.id !== '882695828140073052') return;
    const fetchedLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd,
    });
    const banLog = fetchedLogs.entries.first();

    if (!banLog) {
      sendMessageInBorderSecurity(client, {
        embeds: [
          {
            title: `${ban.user.tag} was banned`,
            description: `Reason: ${
              ban.reason ? ban.reason : 'No reason given'
            }`,
            color: Colors.Red,
          },
        ],
      });
      return;
    }
    const { executor, target } = banLog;
    if ((target as User).id && (target as User).id === ban.user.id) {
      sendMessageInBorderSecurity(client, {
        embeds: [
          {
            title: `${ban.user.tag} was banned`,
            description: `Reason: ${
              ban.reason ? ban.reason : 'No reason given'
            }\nExecutor: ${executor?.tag}`,
            color: Colors.Red,
          },
        ],
      });
    } else {
      sendMessageInBorderSecurity(client, {
        embeds: [
          {
            title: `${ban.user.tag} was banned`,
            description: `Reason: ${
              ban.reason ? ban.reason : 'No reason given'
            }`,
            color: Colors.Red,
          },
        ],
      });
    }
  }
}
