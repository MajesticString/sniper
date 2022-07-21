import {
  Colors,
  EmbedBuilder,
  GuildEmoji,
  Message,
  TextChannel,
} from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';
import { reactionSnipes, UniversalEmoji } from './snipes.js';

const formatEmoji = (emoji: UniversalEmoji | undefined) => {
  // this is a little confusing, but ill try to explain:
  // The outer statement checks if the emoji exists. If it doesn't, it returns an empty string.
  // The inner statement checks if the bot can use the emoji, then returns it as a string.
  return emoji
    ? !emoji.id || (emoji as GuildEmoji).available
      ? emoji.toString() // bot has access or unicode emoji
      : `[:${emoji.name}:](${emoji.url})`
    : ''; // bot cannot use the emoji
};

export default class ReactionsnipeCommand extends BaseCommand {
  constructor() {
    super(
      'reactionsnipe',
      'util',
      ['rsnipe'],
      0,
      'Shows the last removed reaction from a message in this channel'
    );
  }

  async run(client: DiscordClient, message: Message) {
    const snipe = reactionSnipes[message.channel.id];
    const channelSnipe = snipe;

    await reply(
      message,
      channelSnipe
        ? new EmbedBuilder()
            .setDescription(
              `reacted with ${formatEmoji(
                channelSnipe.emoji
              )} on [this message](${channelSnipe.messageURL})`
            )
            .setAuthor({ name: channelSnipe.user?.tag ?? '' })
            .setColor(Colors.Green)
            .setFooter({
              text: `#${(message.channel as TextChannel).name}`,
            })
            .setTimestamp(channelSnipe.createdAt)
        : { title: "There's nothing to snipe!" }
    );
  }
}
