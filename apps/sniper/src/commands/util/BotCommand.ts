import { Colors, Message, version } from 'discord.js';
import ms from 'ms';
import type { DiscordClient } from '../../client/client.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class BotCommand extends BaseCommand {
  constructor() {
    super('bot', 'util', [], 15000, 'Shows information about the bot');
  }

  async run(client: DiscordClient, message: Message): Promise<void> {
    message.channel.send({
      embeds: [
        {
          title: `${client.user?.tag}`,
          description: `${
            client.user?.presence?.activities?.length ?? 0 > 0
              ? client.user?.presence.activities[0].name
              : 'No activity'
          }`,
          fields: [
            {
              name: 'Commands',
              value: client.commands.size.toString(),
              inline: true,
            },
            {
              name: 'ID',
              value: `${client.user?.id}`,
              inline: true,
            },
            {
              name: 'Guilds',
              value: `${client.guilds.cache.size}`,
              inline: true,
            },
            {
              name: 'Users',
              value: `${client.guilds.cache.reduce(
                (acc, g) => (acc += g.memberCount),
                0
              )}`,
              inline: true,
            },

            {
              name: 'Discord.js Version',
              value: `${version}`,
              inline: true,
            },
            {
              name: 'Node.js Version',
              value: `${process.version}`,
              inline: true,
            },
            {
              name: 'Uptime',
              value: `${ms(client.uptime ?? 0)}`,
              inline: true,
            },
            {
              name: 'Memory Usage',
              value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
                2
              )} MB`,
              inline: true,
            },

            {
              name: 'Github Repo',
              value: 'https://github.com/MajesticString/sniper',
              inline: true,
            },
          ],
          color: Colors.White,
          footer: {
            text: `Made by ||harry potter||#0014\nMore info can be found using the \`ping\` command.`,
          },
          timestamp: new Date().toLocaleString(),
        },
      ],
    });
  }
}
