import type { Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class PronounceCommand extends BaseCommand {
  constructor() {
    super('pronounce', 'general', [], 1000, 'Pronounces anything.');
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (!args[0])
      return reply(message, 'Please provide a word/sentence to pronounce.');
    message.channel.sendTyping();

    reply(
      message,
      {
        title: 'Here you go',
        description: args.join(' '),
      },
      {
        files: [
          {
            attachment: `https://www.google.com/speech-api/v1/synthesize?text=${
              args.join(' ') ? encodeURI(args.join(' ')) : 'aaaaaaa'
            }&enc=mpeg&lang=en&speed=0.5&client=lr-language-tts&use_google_only_voices=1`,
            name: 'pron.mp3',
          },
        ],
      }
    );
  }
}
