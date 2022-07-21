import {
  AuditLogEvent,
  Colors,
  GuildMember,
  TextChannel,
  VoiceChannel,
} from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { sendMessageInBorderSecurity } from '../../utils/helpers/cambridge-server.js';
import { BaseEvent } from '../../utils/structures/BaseEvent.js';

export default class GuildMemberRemoveEvent extends BaseEvent {
  constructor() {
    super('guildMemberRemove');
  }

  async run(client: DiscordClient, member: GuildMember) {
    if (member.guild.id === '631138980322344960' && !member.user.bot) {
      (
        member.guild.channels.cache.get('631262532677533726') as TextChannel
      ).send(`${member.user.tag} has left the server.`);
    }
    if (member.guild.id === '882695828140073052') {
      (client.channels.cache.get('891408397570818098') as VoiceChannel).setName(
        '👥 members: ' + member.guild.memberCount
      );
    }
    if (member.guild.id === '882695828140073052') {
      const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick,
      });
      const kickLog = fetchedLogs.entries.first();
      if (!kickLog) {
        sendMessageInBorderSecurity(client, {
          embeds: [
            {
              title: `${member.user.tag} has just left the server!`,
              color: Colors.Orange,
            },
          ],
        });
        return;
      }
      const { executor, target: t } = kickLog;
      const target = t;
      if (target?.id && target.id === member.id) {
        (client.channels.cache.get('882695828140073054') as TextChannel).send({
          embeds: [
            {
              title: `${member.user.tag} was just kicked by ${executor?.tag}!`,
              color: Colors.Orange,
            },
          ],
        });
      } else {
        sendMessageInBorderSecurity(client, {
          embeds: [
            {
              title: `${member.user.tag} has just left the server!`,
              color: Colors.Orange,
            },
          ],
        });
      }
    }
    // michael
    else if (member.guild.id === '899035595081396255')
      (client.channels.cache.get('909122555229642802') as TextChannel).send({
        embeds: [
          {
            title: `${member.user.tag} has just left the server!`,
            color: Colors.Orange,
          },
        ],
      });
  }
}
