import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Collection } from 'discord.js';
import ms from 'ms';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { DiscordClient } from '../client/client.js';
import type { BaseCommand } from './structures/BaseCommand.js';
import { ApplicationCommandsRegistry } from './structures/BaseCommand.js';
import type { BaseEvent } from './structures/BaseEvent.js';

// interface CommandHelper {
//   [name: string]: CommandCategory;
// }

interface CommandCategory {
  commands: Array<Commands>;
}

interface Commands {
  name: string;
  value: string;
}
export const helpCommandHelperCollection = new Collection<
  string,
  CommandCategory
>();
interface Type<T> extends Function {
  new (...args: any[]): T;
}
export const interactions: RESTPostAPIApplicationCommandsJSONBody[] = [];

export function registerCommands(client: DiscordClient, dir = '') {
  const filePath = path.join(process.cwd(), dir);
  const files = fs.readdirSync(filePath);

  const applicationCommandsRegistry = new ApplicationCommandsRegistry();

  for (const file of files) {
    const stat = fs.lstatSync(path.join(filePath, file));

    if (stat.isDirectory()) {
      registerCommands(client, path.join(dir, file));
      // helpCommandHelper[file] = { commands: [] };
      helpCommandHelperCollection.set(file, { commands: [] });
    }
    if (file.endsWith('Command.js') || file.endsWith('Command.ts')) {
      let Command: Type<BaseCommand>;

      import('../../' + path.join(dir, file)).then(({ default: c }) => {
        Command = c;
        const command = new Command();
        client.commands.set(command.name, command);

        if (command.registerApplicationCommands) {
          console.log('registering command: ' + command.name);
          command.registerApplicationCommands(
            client,
            applicationCommandsRegistry
          );
        } else if (
          command.chatInputRun &&
          !command.registerApplicationCommands &&
          command.registerChatInput
        ) {
          console.log('registering command: ' + command.name);
          applicationCommandsRegistry.registerChatInputCommand((b) =>
            b.setName(command.name).setDescription(command.description)
          );
        }

        if (helpCommandHelperCollection.has(command.category)) {
          helpCommandHelperCollection.get(command.category)?.commands.push({
            name: command.name,
            value: `${command.description}\n${
              command.argsDescription
                ? `Args: ${command.argsDescription}\n`
                : ''
            }Cooldown: ${ms(command.cooldown)}`,
          });
        }

        client.commands.set(command.name, command);

        command.aliases.forEach((alias: string) => {
          const commandClone = Object.assign({}, command);
          commandClone.isAlias = true;
          client.commands.set(alias, commandClone);
        });
      });
    }
  }
}

export function registerEvents(client: DiscordClient, dir = '') {
  const filePath = path.join(process.cwd(), dir);
  const files = fs.readdirSync(filePath);
  for (const file of files) {
    const stat = fs.lstatSync(path.join(filePath, file));
    if (stat.isDirectory()) registerEvents(client, path.join(dir, file));
    if (file.endsWith('Event.js') || file.endsWith('Event.ts')) {
      let Event: Type<BaseEvent>;

      import('../../' + path.join(dir, file)).then(({ default: e }) => {
        Event = e;
        const event = new Event();
        client.events.set(event.name, event);
        client.on(event.name, event.run.bind(event, client));
      });
    }
  }
}
