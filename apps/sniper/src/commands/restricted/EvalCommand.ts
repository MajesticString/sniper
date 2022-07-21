import { Colors, CommandInteraction, Message } from 'discord.js';
import { inspect } from 'node:util';
import type { DiscordClient } from '../../client/client.js';
import { goodServers } from '../../sniper.js';
import { reply } from '../../utils/helpers/message.js';
import * as userImport from '../../utils/helpers/user.js';
import BaseCommand, {
  ApplicationCommandsRegistry,
} from '../../utils/structures/BaseCommand.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as snipesImport from '../util/snipes.js';

export default class EvalCommand extends BaseCommand {
  constructor() {
    super(
      'eval',
      'restricted',
      [],
      0,
      'Executes Javascript code. Can only be used by the owner(s) of the bot.'
    );
  }

  registerApplicationCommands(
    client: DiscordClient,
    registry: ApplicationCommandsRegistry
  ) {
    registry.registerChatInputCommand(
      (b) =>
        b
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((i) =>
            i
              .setName('code')
              .setDescription('The code to execute.')
              .setRequired(true)
          ),
      goodServers
    );
  }
  async chatInputRun(
    client: DiscordClient,
    interaction: BaseCommand.ChatInputCommandInteraction
  ) {
    if (interaction.user.id === '696554549418262548') {
      const { result, success } = await this.eval(
        client,
        interaction,
        interaction.options.getString('code', true),
        {
          async: true,
          depth: 10,
          showHidden: false,
        }
      );

      const output = success
        ? `\`\`\`js\n${result}\n\`\`\``
        : `**ERROR**: ${`\`\`\`bash\n${result}\n\`\`\``}`;

      if (output.length > 2000) {
        return interaction.reply({
          content: `Output was too long... sent the result as a file.`,
          files: [{ attachment: Buffer.from(output), name: 'output.js' }],
        });
      }
      return interaction.reply(`${output}`);
      // try {
      //   const evalScript = async () => {
      //     eval(args.join(' '));
      //   };
      //   evalScript().catch(console.error);
      //   reply(interaction, { title: 'success', color: Colors.Green }).then((msg) =>
      //     setTimeout(() => msg.delete(), 3000)
      //   );
      // } catch (err) {
      //   reply(interaction, {
      //     title: 'you messed up your code:\n' + err,
      //     color: Colors.Red,
      //   });
      // }
    } else {
      reply(interaction, {
        title: "You can't use this command.",
        description:
          'This command is so dangerous (it could literally wipe all files of the server this bot is running on) that only the creator of the bot can use it.',
        color: Colors.Red,
      });
    }
  }
  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (message.author.id === '696554549418262548') {
      const { result, success } = await this.eval(
        client,
        message,
        args.join(' '),
        {
          async: true,
          depth: 10,
          showHidden: false,
        }
      );

      const output = success
        ? `\`\`\`js\n${result}\n\`\`\``
        : `**ERROR**: ${`\`\`\`bash\n${result}\n\`\`\``}`;

      if (output.length > 2000) {
        return message.reply({
          content: `Output was too long... sent the result as a file.`,
          files: [{ attachment: Buffer.from(output), name: 'output.js' }],
        });
      }
      return message.reply(`${output}`);
      // try {
      //   const evalScript = async () => {
      //     eval(args.join(' '));
      //   };
      //   evalScript().catch(console.error);
      //   reply(message, { title: 'success', color: Colors.Green }).then((msg) =>
      //     setTimeout(() => msg.delete(), 3000)
      //   );
      // } catch (err) {
      //   reply(message, {
      //     title: 'you messed up your code:\n' + err,
      //     color: Colors.Red,
      //   });
      // }
    } else {
      reply(message, {
        title: "You can't use this command.",
        description:
          'This command is so dangerous (it could literally wipe all files of the server this bot is running on) that only the creator of the bot can use it.',
        color: Colors.Red,
      });
    }
  }
  private async eval(
    client: DiscordClient,
    message: Message | CommandInteraction,
    code: string,
    flags: { async: boolean; depth: number; showHidden: boolean }
  ) {
    if (flags.async) code = `(async () => {\n${code}\n})();`;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const msg = message;

    let success = true;
    let result = null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- its for the eval; it wont be used until the command is actually used and whatnot idk
      const addCoinsToTotal = userImport.addCoinsToTotal;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- its for the eval; it wont be used until the command is actually used and whatnot idk
      const getTotalCoins = userImport.getTotalCoins;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- its for the eval; it wont be used until the command is actually used and whatnot idk
      const setTotalCoins = userImport.setTotalCoins;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- its for the eval; it wont be used until the command is actually used and whatnot idk
      const util = await import('node:util');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- its for the eval; it wont be used until the command is actually used and whatnot idk
      const snipes = snipesImport;
      // eslint-disable-next-line no-eval
      result = eval(code);
    } catch (error) {
      if (error && error instanceof Error && error.stack) {
        console.error(error);
      }
      result = error;
      success = false;
    }

    if (result.then) result = await result;

    if (typeof result !== 'string') {
      result = inspect(result, {
        depth: flags.depth,
        showHidden: flags.showHidden,
      });
    }

    return { result, success };
  }
}
