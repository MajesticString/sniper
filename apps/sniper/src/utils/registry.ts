import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v9';
import { Collection } from 'discord.js';
import { default as ms } from 'ms';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import DiscordClient from '../client/client.js';
import BaseCommand from './structures/BaseCommand.js';
import BaseEvent from './structures/BaseEvent.js';

// interface CommandHelper {
//   [name: string]: CommandCategory;
// }

const allCommandsJSON = JSON.parse(
  await fs.readFile('./all-commands.json', 'utf-8')
);

interface CommandCategory {
  commands: Array<Commands>;
}

interface Commands {
  name: string;
  value: string;
}
// export const helpCommandHelper: CommandHelper = {};
export const helpCommandHelperCollection = new Collection<
  string,
  CommandCategory
>();

export const interactions: RESTPostAPIApplicationCommandsJSONBody[] = [];

export async function registerCommands(client: DiscordClient, dir = '') {
  const filePath = path.join(process.cwd(), dir);
  const files = await fs.readdir(filePath);

  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));

    if (stat.isDirectory()) {
      registerCommands(client, path.join(dir, file));
      // helpCommandHelper[file] = { commands: [] };
      helpCommandHelperCollection.set(file, { commands: [] });
    }
    if (file.endsWith('Command.js') || file.endsWith('Command.ts')) {
      const Command = (await import('../../' + path.join(dir, file))).default;
      const command = new Command() as BaseCommand;

      // if (!command.permissionsRequired) {
      //   command.permissionsRequired = [];
      // }
      if (helpCommandHelperCollection.has(command.category)) {
        helpCommandHelperCollection.get(command.category)?.commands.push({
          name: command.name,
          value: `${command.description}\n${
            command.argsDescription ? `Args: ${command.argsDescription}\n` : ''
          }Cooldown: ${ms(command.cooldown)}`,
        });
      }
      // if (helpCommandHelper[command.category])
      //   helpCommandHelper[command.category].commands.push({
      //     name: command.name,
      //     value: `${command.description}\n${
      //       command.argsDescription ? `Args: ${command.argsDescription}\n` : ''
      //     }Cooldown: ${ms(command.cooldown)}`,
      //   });

      client.commands.set(command.name, command);
      command.aliases.forEach((alias: string) => {
        client.commands.set(alias, command);
      });
      if (!allCommandsJSON[command.category])
        allCommandsJSON[command.category] = {};
      allCommandsJSON[command.category][command.name] = {
        name: command.name,
        aliases: command.aliases,
        description: command.description,
        args: command.argsDescription,
        cooldown: command.cooldown,
        disabled: command.disabled,
        permissions: command.permissionsRequired,
        argsRequired: command.argsRequired,
      };
      await fs.writeFile(
        './all-commands.json',
        JSON.stringify(allCommandsJSON, null, 2)
      );

      if (command.interactionData) {
        interactions.push(command.interactionData.toJSON());
      }
    }
  }
}

export async function registerEvents(client: DiscordClient, dir = '') {
  const filePath = path.join(process.cwd(), dir);
  const files = await fs.readdir(filePath);
  for (const file of files) {
    const stat = await fs.lstat(path.join(filePath, file));
    if (stat.isDirectory()) registerEvents(client, path.join(dir, file));
    if (file.endsWith('Event.js') || file.endsWith('Event.ts')) {
      const { default: Event } = await import('../../' + path.join(dir, file));
      const event = new Event() as BaseEvent;
      client.events.set(event.name, event);
      client.on(event.name, event.run.bind(event, client));
    }
  }
}
