import { Colors, Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import type { GithubCommits } from '../../typings/types.js';
import { fetch } from '../../utils/helpers/fetch.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class ChangelogCommand extends BaseCommand {
  constructor() {
    super(
      'changelog',
      'general',
      [],
      5000,
      'Literally just gets Github commits to this bot.',
      {
        cooldownMessage: 'this cooldown is to prevent spam.',
        argsDescription:
          '[number of changes to get. defaults to 5. this argument cannot go above 10.]',
      }
    );
  }

  run(_client: DiscordClient, message: Message, args: Array<string>) {
    fetch<GithubCommits>(
      `https://api.github.com/repos/MajesticString/sniper/commits?per_page=${
        args[0] ? (parseInt(args[0]) > 10 ? '10' : args[0]) : '5'
      }`
    ).then((res) => {
      const data = res;
      const toReadableDate = (date: string) => {
        return new Date(date).toUTCString();
      };
      const githubCommitMessages: any[] = [];
      data.forEach((commit) => {
        githubCommitMessages.push({
          name: toReadableDate(commit.commit.author.date),
          value: commit.commit.message,
        });
      });
      reply(message, {
        title: 'Changelog',
        fields: githubCommitMessages,
        color: Colors.White,
      });
    });
  }
}
