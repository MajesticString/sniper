import { red } from 'colorette';
import {
  APIEmbed,
  Collection,
  Colors,
  PermissionFlagsBits,
  type Message,
} from 'discord.js';
import ms from 'ms';
import type { DiscordClient } from '../../client/client.js';
import { harrysDiscordID } from '../../sniper.js';
import { log } from '../../utils/helpers/console.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseEvent } from '../../utils/structures/BaseEvent.js';
// import { sleep } from '../../utils/helpers/misc';
// import {
//   getGuildSettings,
//   setDefaultGuildSettings,
// } from '../../utils/helpers/fb';
const cooldowns = new Collection<string, Collection<string, number>>();
// const exCooldowns = new Collection();

export default class MessageCreateEvent extends BaseEvent {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.channel.isDMBased()) return;

    if (
      (message.author.id !== '922939398239174699' && message.author.bot) ||
      !message.guild
    )
      return;

    // const guildSettings = await getGuildSettings(message.guild.id);

    // if (guildSettings!.ranks) {

    // }

    if (message.content === client.user?.toString())
      client.commands.get('help')?.run(client, message, []);

    if (
      message.content.toLowerCase().startsWith('pls ') &&
      ['snipe', 'editsnipe', 'reactionsnipe', 'esnipe', 'rsnipe'].includes(
        message.content.toLowerCase().slice(4)
      ) &&
      (
        ((await client.db.getGuildSettings(message.guildId ?? ''))?.prefixes &&
        (await client.db.getGuildSettings(message.guildId ?? ''))?.prefixes[0]
          ? (await client.db.getGuildSettings(message.guildId ?? ''))?.prefixes
          : client.prefix) as string[]
      )[0] !== 'pls '
    ) {
      message.reply(
        'Sniper running commands with the `pls` prefix has been removed.\nPlease use one of the following prefixes instead:\n' +
          (
            ((await client.db.getGuildSettings(message.guildId ?? ''))
              ?.prefixes &&
            (await client.db.getGuildSettings(message.guildId ?? ''))
              ?.prefixes[0]
              ? (await client.db.getGuildSettings(message.guildId ?? ''))
                  ?.prefixes
              : client.prefix) as string[]
          )
            .map((p) => `\`${p}\``)
            .join(', ')
      );
    }
    const prefixes =
      (await client.db.getGuildSettings(message.guildId ?? ''))?.prefixes &&
      (await client.db.getGuildSettings(message.guildId ?? ''))?.prefixes[0]
        ? (await client.db.getGuildSettings(message.guildId ?? ''))?.prefixes
        : client.prefix;
    for (const prefix of prefixes) {
      if (message.content.startsWith(prefix.toLowerCase())) {
        if (
          !message.guild.members.me?.permissions.has(
            PermissionFlagsBits.SendMessages
          )
        ) {
          message.author.send('I cant send messages in that server.');
        }
        const [cmdName, ...cmdArgs] = message.content
          .slice(prefix.length)
          .trim()
          .split(/\s+/);
        const command = client.commands.get(cmdName.toLowerCase());

        if (!command) {
          return;
        }

        if (
          command.category === 'test' &&
          message.author.id !== harrysDiscordID
        ) {
          const embed: APIEmbed = {
            title: 'This command is in the category of `test`',
            description:
              'Test commands are in development and are generally unstable and prone to errors. They are disabled because are sometimes capable of mentioning everyone and changing peoples permissions',
            color: Colors.Red,
          };
          return reply(message, embed);
        }

        if (
          command?.disabled &&
          message.author.id !== '792862384489758760' &&
          message.author.id !== harrysDiscordID
        ) {
          reply(message, {
            title: 'This command is disabled.',
            color: Colors.Red,
          });
          return;
        }
        if (!cooldowns.has(command?.name)) {
          cooldowns.set(command?.name, new Collection());
        }

        const currentTime = Date.now();
        const timeStamps = cooldowns.get(command?.name);
        const cooldownAmount = command?.cooldown;
        const cooldownMessage = command?.cooldownMessage;

        if (!timeStamps)
          return reply(message, {
            title: 'An error occured. Try again in a few seconds.',
            color: Colors.Red,
          });

        if (
          timeStamps.has(message.author.id) &&
          message.author.id !== '696554549418262548'
        ) {
          const expirationTime =
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We now know that it wont be undefined because of the `timeStamps.has`
            timeStamps.get(message.author.id)! + cooldownAmount;

          if (currentTime < expirationTime) {
            const timeLeft = expirationTime - currentTime;

            return reply(message, {
              title: cooldownMessage.replaceAll(
                /\{\{\s?time\s?\}\}/gi,
                ms(timeLeft, { long: true })
              ),
              description: `Wait ${ms(timeLeft, {
                long: true,
              })} before using this command`,
              color: Colors.Red,
            });
          }
        }
        timeStamps.set(message.author.id, currentTime);
        setTimeout(() => timeStamps.delete(message.author.id), cooldownAmount);
        if (command) {
          if (
            command.category === 'restricted' &&
            message.author.id !== harrysDiscordID
          ) {
            reply(message, {
              title: 'This command is restricted.',
              color: Colors.Red,
            });
            return;
          }
          for (const permission of command?.permissionsRequired ?? [
            'SEND_MESSAGES',
            'READ_MESSAGE_HISTORY',
          ]) {
            if (!message.member?.permissions.has(permission)) {
              reply(message, {
                title: `You do not have the permission to use this command.`,
                color: Colors.Red,
              });
              return;
            }
          }
          try {
            const commandsIssued = await this.db.db
              .collection('bot')
              .doc('stats')
              .get();

            this.db.db
              .collection('bot')
              .doc('stats')
              .set(
                { commandsIssued: commandsIssued.data()?.commandsIssued + 1 },
                { merge: true }
              );

            log(
              `${message.author.tag} used ${command?.name} in ${message.guild.name}`
            );
            if (!cmdArgs[0] && command.argsRequired) {
              reply(message, {
                title: 'This command requires arguments.',
                description: `${command.argsDescription}`,
                color: Colors.Red,
              });
              return;
            }
            if (
              message.channel
                .permissionsFor(client.user ?? '')
                ?.has(PermissionFlagsBits.SendMessages)
            ) {
              command.run(client, message, cmdArgs);
              client.db.db
                .collection('stats')
                .doc(command.name)
                .set({
                  used:
                    ((
                      await client.db.db
                        .collection('stats')
                        .doc(command.name)
                        .get()
                    ).data()?.used ?? 0) + 1,
                });
            } else
              message.author.send("I can't send messages in that channel.");
          } catch (error) {
            log(red(error as any));
            reply(message, {
              title: 'An error occurred while running this command.',
              description: `Error: ${error}`,
            });
          }
        }
      }
    }
  }
}
