import {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
} from '@discordjs/builders';
import type {
  ApplicationCommandType,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import type {
  Awaitable,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ContextMenuCommandInteraction,
  Message,
  PermissionsString,
} from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import { commands } from '../commands.js';

interface ExtraCommandOptions {
  cooldownMessage?: string;
  argsDescription?: string;
  argsRequired?: boolean;
  permissions?: PermissionsString[];
  disabled?: boolean;
  slashCommandType?: ApplicationCommandType;
  /**
   * The tip shown in the docs
   */
  tip?: string;
  registerChatInput?: boolean;
}

export abstract class BaseCommand {
  /**
   * @param _name the name of the command
   * @param _category category
   * @param _aliases other words to trigger the command
   * @param _cooldown how long (in ms) before the same command can be triggered again. defaults to 0
   * @param _description description in the help command
   */
  constructor(
    private _name: string,
    private _category: string,
    private _aliases: Array<string>,
    private _cooldown: number,
    private _description: string,
    private extraCommandOptions: ExtraCommandOptions = {
      cooldownMessage: "You can't use this command yet",
      argsDescription: undefined,
      argsRequired: false,
      permissions: ['SendMessages', 'ReadMessageHistory', 'ViewChannel'],
      disabled: false,
      registerChatInput: false,
    }
  ) {}

  get name(): string {
    return this._name;
  }
  get category(): string {
    return this._category;
  }
  get aliases(): Array<string> {
    return this._aliases;
  }
  get cooldown(): number {
    return this._cooldown || 0;
  }
  get description(): string {
    return this._description || '';
  }
  get cooldownMessage(): string {
    return (
      this.extraCommandOptions?.cooldownMessage ||
      "You can't use this command yet"
    );
  }
  get argsDescription(): string | undefined {
    return this.extraCommandOptions?.argsDescription ?? undefined;
  }
  get permissionsRequired(): PermissionsString[] {
    return (
      this.extraCommandOptions?.permissions || [
        'SendMessages',
        'ReadMessageHistory',
        'ViewChannel',
      ]
    );
  }
  get argsRequired(): boolean {
    return this.extraCommandOptions?.argsRequired ?? false;
  }
  get disabled(): boolean {
    return this.extraCommandOptions?.disabled ?? false;
  }
  get slashCommandType(): ApplicationCommandType | undefined {
    return this.extraCommandOptions?.slashCommandType;
  }
  get tip(): string {
    return this.extraCommandOptions?.tip ?? '';
  }
  get registerChatInput(): boolean {
    return this.extraCommandOptions.registerChatInput ?? false;
  }

  isAlias = false;

  /**
   *
   * @param {DiscordClient} client
   * @param {Message | CommandInteraction} message
   * @param {Array<string> | CommandInteractionOptionResolver | null} args
   * @returns {Promise<void>}
   */
  abstract run(
    client: DiscordClient,
    message: Message | CommandInteraction,
    args: Array<string> | CommandInteractionOptionResolver | null
  ): Awaitable<unknown>;

  contextMenuRun?(
    client: DiscordClient,
    interaction: ContextMenuCommandInteraction
  ): Awaitable<unknown>;

  /**
   * thanks sapphire
   */
  registerApplicationCommands?(
    client: DiscordClient,
    registry: ApplicationCommandsRegistry
  ): Awaitable<void>;

  /**
   * thanks sapphire x2
   */
  chatInputRun?(
    client: DiscordClient,
    interaction: BaseCommand.ChatInputCommandInteraction
  ): Awaitable<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BaseCommand {
  export type ChatInputCommandInteraction =
    import('discord.js').ChatInputCommandInteraction;
  export type CommandsRegistry = ApplicationCommandsRegistry;
  export type Client = DiscordClient;
}
export default BaseCommand;

export class ApplicationCommandsRegistry {
  registerChatInputCommand(
    builder:
      | SlashCommandBuilder
      | ((
          builder: SlashCommandBuilder
        ) =>
          | SlashCommandBuilder
          | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>),
    guildIds?: string[]
  ) {
    let builtBuilder: RESTPostAPIApplicationCommandsJSONBody;
    if (builder instanceof SlashCommandBuilder) {
      builtBuilder = builder.toJSON();
    } else {
      builtBuilder = builder(new SlashCommandBuilder()).toJSON();
    }
    commands.push({ command: builtBuilder, guildIds });
  }

  registerContextMenuCommand(
    builder:
      | ContextMenuCommandBuilder
      | ((
          builder: ContextMenuCommandBuilder
        ) =>
          | ContextMenuCommandBuilder
          | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>)
  ) {
    let builtBuilder: RESTPostAPIApplicationCommandsJSONBody;
    if (builder instanceof ContextMenuCommandBuilder) {
      builtBuilder = builder.toJSON();
    } else {
      builtBuilder = builder(new ContextMenuCommandBuilder()).toJSON();
    }
    commands.push({ command: builtBuilder });
  }
}
