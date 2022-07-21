import { cleanContent, Message } from 'discord.js';
import ms from 'ms';
import type { DiscordClient } from '../../client/client.js';
import { snipes } from '../../commands/util/snipes.js';
import { log } from '../../utils/helpers/console.js';
import { sleep } from '../../utils/helpers/misc.js';
import { BaseEvent } from '../../utils/structures/BaseEvent.js';

export default class MessageDeleteEvent extends BaseEvent {
  constructor() {
    super('messageDelete');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.partial || message.author.bot) return; // content is null
    if (
      message.content.toLowerCase() !== '.pick' &&
      message.guildId === '882695828140073052'
    )
      log(
        `${message.guild?.name}: ${
          message.member?.user.username
        }: ${cleanContent(message.content, message.channel)}`
      );

    snipes[message.channelId] = {
      author: message.author,
      content: message.content,
      createdAt: message.createdTimestamp,
      attachment: message.attachments.first()?.url,
      attachments: [...message.attachments.values()]?.map((a) => a.proxyURL),
      embeds: message.embeds,
      message,
      cmdId: message.id,
    };
    // const snipeContent: any = {};
    // snipeContent[message.channel.id] = {
    //   author: message.author.id,
    //   content: message.content,
    //   createdAt: message.createdTimestamp,

    //   // attachment: message.attachments.first()?.url,
    // };
    // setSnipe(snipeContent);

    await sleep(ms('1h'));

    if (
      snipes[message.channelId] &&
      snipes[message.channelId]?.createdAt === message.createdTimestamp
    ) {
      delete snipes[message.channelId];
    }
  }
}
