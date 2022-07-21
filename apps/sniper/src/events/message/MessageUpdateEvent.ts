// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageUpdate
import { cleanContent, Message } from 'discord.js';
import ms from 'ms';
import type { DiscordClient } from '../../client/client.js';
import { editSnipes } from '../../commands/util/snipes.js';
import { log } from '../../utils/helpers/console.js';
import { sleep } from '../../utils/helpers/misc.js';
import { BaseEvent } from '../../utils/structures/BaseEvent.js';

export default class MessageUpdateEvent extends BaseEvent {
  constructor() {
    super('messageUpdate');
  }

  async run(client: DiscordClient, oldMessage: Message, newMessage: Message) {
    if (oldMessage.partial) return; // content is null
    if (oldMessage.content !== newMessage.content) {
      if (oldMessage.guildId === '882695828140073052')
        log(
          `old message (${oldMessage.guild?.name}):\n${cleanContent(
            oldMessage.content,
            oldMessage.channel
          )}\nnew message:\n${cleanContent(
            newMessage.content,
            newMessage.channel
          )}`
        );
      editSnipes[oldMessage.channelId] = {
        author: oldMessage.author,
        content: oldMessage.content,
        createdAt: newMessage.editedTimestamp,
        id: newMessage.id,
        cmdId: '',
      };
      await sleep(ms('1h'));

      if (
        editSnipes[oldMessage.channelId]?.createdAt ===
        newMessage.editedTimestamp
      ) {
        delete editSnipes[oldMessage.channelId];
      }
    }
  }
}
