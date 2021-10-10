import BaseEvent from '../../utils/structures/BaseEvent';
import {
  Message,
  MessageActionRow,
  MessageButton,
  Collection,
} from 'discord.js';
import DiscordClient from '../../client/client';

const cooldowns = new Map();

export default class MessageEvent extends BaseEvent {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    if (
      message.channel.id === '894742416345665576' &&
      message.author.id !== '696554549418262548'
    ) {
      if (
        message.content.toLowerCase() === 'science' ||
        message.content.toLowerCase().startsWith('bio')
      ) {
        message.member?.roles
          .add(
            message.guild!.roles.cache.find((role) => role.name === 'verified')!
          )
          .then(() => {
            message.delete();
          });
      }
    }

    if (
      message.content.toLowerCase().startsWith('pls snipe') ||
      message.content.toLowerCase().startsWith('pls reactionsnipe') ||
      message.content.toLowerCase().startsWith('pls editsnipe')
    ) {
      message.reply({
        embeds: [
          {
            title: '`pls snipe` has been replaced by `,,snipe`',
            description:
              'This is to avoid overlap with Dank Memer commands, as well as to maintain consistency with sniper commands.\nDank Memer no longer supports snipe and related commands. To view their post about it, hit the button below.',
            color: 'RED',
          },
        ],
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setLabel('Visit Blog Post')
              .setStyle('LINK')
              .setURL('https://dankmemer.lol/blogs/rip-snipe')
          ),
        ],
      });
    }

    if (message.content.startsWith(client.prefix)) {
      const [cmdName, ...cmdArgs] = message.content
        .slice(client.prefix.length)
        .trim()
        .split(/\s+/);
      const command = client.commands.get(cmdName);
      if (!cooldowns.has(command?.name)) {
        cooldowns.set(command?.name, new Collection());
      }

      const currentTime = Date.now();
      const timeStamps = cooldowns.get(command?.name);
      const cooldownAmount = command?.cooldown;

      if (timeStamps.has(message.author.id)) {
        const expirationTime =
          timeStamps.get(message.author.id) + cooldownAmount;

        if (currentTime < expirationTime) {
          const timeLeft = expirationTime - currentTime;

          return message.reply({
            embeds: [
              {
                title: 'you cant use this command yet',
                description: `wait ${Math.floor(
                  timeLeft / 1000
                )} seconds before using this command`,
              },
            ],
          });
        }
      }

      timeStamps.set(message.author.id, currentTime);
      setTimeout(() => timeStamps.delete(message.author.id), cooldownAmount);
      if (command) {
        message.channel.sendTyping();
        try {
          command.run(client, message, cmdArgs);
        } catch (error) {
          message.reply({
            embeds: [
              {
                title: 'An error occurred while running this command.',
                description: `Error: ${error}`,
              },
            ],
          });
        }
      }
    }
  }
}
