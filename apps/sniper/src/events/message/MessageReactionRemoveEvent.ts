// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-messageReactionRemove
import {
  GuildMember,
  MessageReaction,
  PermissionFlagsBits,
  TextChannel,
  User,
} from 'discord.js';
import ms from 'ms';
import type { DiscordClient } from '../../client/client.js';
import { reactionSnipes } from '../../commands/util/snipes.js';
import { sleep } from '../../utils/helpers/misc.js';
import { BaseEvent } from '../../utils/structures/BaseEvent.js';

export default class MessageReactionRemoveEvent extends BaseEvent {
  constructor() {
    super('messageReactionRemove');
  }

  async run(client: DiscordClient, reaction: MessageReaction, user: User) {
    if (reaction.partial || user.bot) return;
    // this causes errors sometimes; idk why (missing access?????)
    const idk = reaction.fetch();
    // so just catch the error to prevent bot crash.
    idk.catch(() => null);
    if (
      (reaction.message.channel as TextChannel)
        .permissionsFor(reaction.message.guild?.members.me as GuildMember)
        .has(PermissionFlagsBits.ReadMessageHistory)
    )
      reaction = await idk;

    reactionSnipes[reaction.message.channelId] = {
      user,
      emoji: reaction.emoji,
      messageURL: reaction.message.url,
      createdAt: reaction.message.createdTimestamp,
      cmdId: '',
    };
    await sleep(ms('1h'));

    if (
      reactionSnipes[reaction.message.channelId]?.createdAt ===
      reaction.message.createdTimestamp
    ) {
      delete reactionSnipes[reaction.message.channelId];
    }
  }
}
