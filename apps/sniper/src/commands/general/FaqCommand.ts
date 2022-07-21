import { EmbedBuilder, Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class FaqCommand extends BaseCommand {
  constructor() {
    super('faq', 'general', [], 1000, 'faq... pretty obvious');
  }

  async run(client: DiscordClient, message: Message) {
    reply(
      message,
      new EmbedBuilder().setTitle('Frequently asked questions').addFields(
        {
          name: '<insert name of command> is broken!',
          value:
            'Submit an issue on our [Github issues page.](https://github.com/MajesticString/sniper/issues)',
        },
        {
          name: 'I have a suggestion for this bot',
          value:
            "That's great! If you know how to code, you can [submit a pull request](https://github.com/MajesticString/sniper/pulls). If you don't, you can submit your feature on our [Github issues page](https://github.com/MajesticString/sniper/issues) (preferred).",
        }
      )
    );
  }
}
