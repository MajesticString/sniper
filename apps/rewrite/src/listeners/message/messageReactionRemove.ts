import { reactionSnipes, sleep } from '#lib';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import type {
  GuildMember,
  MessageReaction,
  TextChannel,
  User,
} from 'discord.js';
import ms from 'ms';

@ApplyOptions<ListenerOptions>({
  event: Events.MessageReactionRemove,
})
export class MessageReactionRemove extends Listener<
  typeof Events.MessageReactionRemove
> {
  public async run(reaction: MessageReaction, user: User) {
    if (reaction.partial || user.bot) return;
    // this causes errors sometimes; idk why (missing access?????)
    const idk = reaction.fetch();
    // so just catch the error to prevent bot crash.
    idk.catch(() => null);
    if (
      (reaction.message.channel as TextChannel)
        .permissionsFor(reaction.message.guild?.members.me as GuildMember)
        .has('READ_MESSAGE_HISTORY')
    )
      reaction = await idk;

    reactionSnipes[reaction.message.channel.id] = {
      user,
      emoji: reaction.emoji,
      messageURL: reaction.message.url,
      createdAt: reaction.message.createdTimestamp,
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
