import { GuildEmoji, Message, MessageEmbed, TextChannel } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/client';
import { reactionSnipes, UniversalEmoji } from './snipes';

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
      'shows the last removed reaction from a message in this channel'
    );
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const snipe = reactionSnipes[message.channel.id];

    await message.reply(
      snipe
        ? {
            embeds: [
              new MessageEmbed()
                .setDescription(
                  `reacted with ${formatEmoji(snipe.emoji)} on [this message](${
                    snipe.messageURL
                  })`
                )
                .setAuthor(snipe.user!.tag!)
                .setColor('RANDOM')
                .setFooter(`#${(message.channel as TextChannel).name}`)
                .setTimestamp(snipe.createdAt!),
            ],
          }
        : "There's nothing to snipe!"
    );
  }
}
