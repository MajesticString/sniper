import { Colors, GuildMember, VoiceChannel } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { sendMessageInBorderSecurity } from '../../utils/helpers/cambridge-server.js';
import { sleep } from '../../utils/helpers/misc.js';
import { BaseEvent } from '../../utils/structures/BaseEvent.js';

export default class GuildMemberAddEvent extends BaseEvent {
  constructor() {
    super('guildMemberAdd');
  }

  async run(client: DiscordClient, member: GuildMember) {
    if (member.guild.id === '882695828140073052') {
      (client.channels.cache.get('891408397570818098') as VoiceChannel).setName(
        '👥 members: ' + member.guild.memberCount
      );
    }
    if (member.guild.id === '882695828140073052' && !member.user.bot) {
      await sleep(150);
      await sendMessageInBorderSecurity(client, {
        embeds: [
          {
            title:
              "This server is for people in the Cambridge Program only. If you don't know what that is, you probably aren't in it.\n\nAlso, please state your preferred name in this channel.",
            description: `[More info on the cambridge program](https://jhs.lwsd.org/academics/cambridge-program)`,
            color: Colors.Red,
          },
        ],
      });
      // const msg = await sendMessageInBorderSecurity(client, {
      //   embeds: [
      //     {
      //       title: 'The next message you send will be your server nickname',
      //     },
      //   ],
      // });
      // const collector = msg.channel.createMessageCollector({
      //   filter: (m) =>
      //     m.author.id === member.user.id &&
      //     m.channelId === '882695828140073054',
      //   idle: 1000,
      // });
      // collector.on('collect', async (msg) => {
      //   const nickMsg = await msg.channel.send({
      //     embeds: [
      //       {
      //         title: 'A moderator/admin must approve the following nickname',
      //         description: `${msg.content}`,
      //       },
      //     ],
      //     components: [
      //       new MessageActionRow().addComponents(
      //         new MessageButton()
      //           .setLabel('Approve')
      //           .setStyle('PRIMARY')
      //           .setCustomId('approve')
      //       ),
      //     ],
      //   });
      //   const approveCollector = nickMsg.createMessageComponentCollector({
      //     filter: (m) =>
      //       (m.member?.roles as GuildMemberRoleManager).cache.hasAny(
      //         '890611099689451530',
      //         '883163151657480212'
      //       ) ?? false,
      //   });
      //   approveCollector.on('collect', async (interaction) => {
      //     if (interaction.customId === 'approve')
      //       member.roles.add(['882696320144531476', '892242857862254652']);
      //   });
      // });
    }
  }
}
