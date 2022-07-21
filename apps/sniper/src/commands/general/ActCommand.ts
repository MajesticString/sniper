import { Colors, Message, PermissionFlagsBits, TextChannel } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { slappeyJSON } from '../../sniper.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class ActCommand extends BaseCommand {
  constructor() {
    super(
      'act',
      'general',
      [],
      5000,
      'Sends a command as someone else. Restricted to certain servers. [Open an issue here to apply](https://github.com/MajesticString/sniper/issues)',
      {
        argsDescription: '<mentioned user> message',
        argsRequired: true,
      }
    );
  }

  async registerApplicationCommands(
    c: never,
    reg: BaseCommand.CommandsRegistry
  ) {
    reg.registerChatInputCommand(
      (b) =>
        b
          .setName(this.name)
          .setDescription(
            'Sends a command as someone else. Restricted to certain servers.'
          )
          .addUserOption((i) =>
            i.setName('user').setDescription('The user to impersonate')
          ),
      slappeyJSON.actServers
    );
  }

  async chatInputRun(
    client: DiscordClient,
    interaction: BaseCommand.ChatInputCommandInteraction
  ) {
    if (
      !(slappeyJSON.actServers as string[]).includes(interaction.guildId ?? '')
    )
      return reply(interaction, {
        title: 'This command is restricted',
        description:
          'This command is restricted to certain servers. If you are a server admin, [open an issue here to apply](https://github.com/MajesticString/sniper/issues)',
      });

    if (
      !interaction.guild?.members.me
        ?.permissionsIn(interaction.channel as TextChannel)
        .has(PermissionFlagsBits.ManageWebhooks)
    )
      return reply(interaction, {
        title: 'I do not have the `Manage Webhooks` permission',
        description:
          'I need the `Manage Webhooks` permission to use this command',
        color: Colors.Red,
      });
    const wh = await (interaction.channel as TextChannel)?.createWebhook({
      name:
        interaction.guild.members.cache.get(
          interaction.options.getUser('user', true).id
        )?.nickname ?? interaction.options.getUser('user', true).username,
      avatar: interaction.options.getUser('user', true).displayAvatarURL(),
      reason: 'sniper command',
    });
    await wh.send({
      content: interaction.options.getString('message', true),
      allowedMentions: { parse: [] },
    });
    await wh.delete('sniper cleanup');
    interaction.reply({
      content: 'Sent!',
      ephemeral: true,
    });
  }
  async run(client: DiscordClient, message: Message, args: Array<string>) {
    if (!(slappeyJSON.actServers as string[]).includes(message.guildId ?? ''))
      return reply(message, {
        title: 'This command is restricted',
        description:
          'This command is restricted to certain servers. If you are a server admin, [open an issue here to apply](https://github.com/MajesticString/sniper/issues)',
      });

    if (
      !message.guild?.members.me
        ?.permissionsIn(message.channel as TextChannel)
        .has(PermissionFlagsBits.ManageWebhooks)
    )
      return reply(message, {
        title: 'I do not have the `Manage Webhooks` permission',
        description:
          'I need the `Manage Webhooks` permission to use this command',
        color: Colors.Red,
      });
    const user = message.mentions.users.first();
    if (!user)
      return reply(message, {
        title: 'You must mention a user',
        color: Colors.Red,
      });
    if (!message.channel.isTextBased())
      return reply(message, 'This command can only be used in text channels');
    const wh = await (message.channel as TextChannel).createWebhook({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      name: message.mentions.members?.first()?.nickname ?? user!.username,
      avatar: user?.displayAvatarURL(),
      reason: 'sniper command',
    });
    message.delete().catch(() => null);
    await wh.send({
      content: args.slice(1).join(' ') ?? '(no content provided)',
      allowedMentions: { parse: [] },
    });
    await wh.delete('sniper cleanup');
  }
}
