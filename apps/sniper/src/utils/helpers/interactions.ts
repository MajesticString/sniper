import {
  ActionRowBuilder,
  APIEmbed,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  Embed,
  EmbedBuilder,
  Message,
  MessageActionRowComponentBuilder,
  MessageCollectorOptionsParams,
} from 'discord.js';
import { isFunction } from 'lodash-es';
import EventEmitter from 'node:events';
import { reply } from './message.js';

export const disableAllComponents = (message: Message) => {
  if (!message.components && !message.components[0]) return message;

  const componentsClone = Object.assign({}, message.components);

  componentsClone.forEach((component) => {
    component.components.forEach((v) => {
      // @ts-ignore -- whatever
      v.disabled = true;
    });
  });
  return message.edit({
    components: componentsClone,
  });
};

export const removeAllComponents = (message: Message) => {
  if (!message.components && !message.components[0]) return message;

  return message.edit({
    components: [],
  });
};
export interface ConfirmationMessageOptions {
  disableComponentsOnDeny?: boolean;
  deleteComponentsOnDeny?: boolean;
  disableComponentsOnConfirm?: boolean;
  deleteComponentsOnConfirm?: boolean;
  confirmButtonLabel?: string;
  denyButtonLabel?: string;
  confirmButtonStyle?: ButtonStyle;
  denyButtonStyle?: ButtonStyle;
  confirmButtonCustomId?: string;
  denyButtonCustomId?: string;
  /**
   * If set, the `confirmButtonCustomId` property must be set.
   */
  customConfirmButton?:
    | ButtonBuilder
    | ((builder: ButtonBuilder) => ButtonBuilder);
  /**
   * If set, the `denyButtonCustomId` property must be set.
   */
  customDenyButton?:
    | ButtonBuilder
    | ((builder: ButtonBuilder) => ButtonBuilder);
  collectorOptions?: MessageCollectorOptionsParams<ComponentType.Button>;
}

export declare interface ConfirmationMessage {
  on(event: 'confirm' | 'deny', listener: (i: ButtonInteraction) => any): this;
}

export class ConfirmationMessage extends EventEmitter {
  embed;
  constructor(
    private message: Message | CommandInteraction,
    embed:
      | Embed
      | EmbedBuilder
      | APIEmbed
      | ((builder: EmbedBuilder) => EmbedBuilder),
    private options?: ConfirmationMessageOptions
  ) {
    super({ captureRejections: true });
    this.embed = isFunction(embed)
      ? embed(new EmbedBuilder()).toJSON()
      : embed instanceof EmbedBuilder
      ? embed.toJSON()
      : embed;
    this.createCollector();
  }

  private async createCollector() {
    const msg = (await reply(this.message, this.embed, {
      components: [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
          (isFunction(this.options?.customDenyButton)
            ? this.options?.customDenyButton(new ButtonBuilder())
            : this.options?.customDenyButton) ??
            new ButtonBuilder()
              .setCustomId(this.options?.denyButtonCustomId ?? 'confirm')
              .setLabel(this.options?.denyButtonLabel ?? 'Yes')
              .setStyle(this.options?.denyButtonStyle ?? ButtonStyle.Success),
          (isFunction(this.options?.customDenyButton)
            ? this.options?.customDenyButton(new ButtonBuilder())
            : this.options?.customDenyButton) ??
            new ButtonBuilder()
              .setCustomId(this.options?.denyButtonCustomId ?? 'deny')
              .setLabel(this.options?.denyButtonLabel ?? 'No')
              .setStyle(this.options?.denyButtonStyle ?? ButtonStyle.Danger)
        ),
      ],
    })) as Message;
    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      dispose: this.options?.collectorOptions?.dispose,
      time: this.options?.collectorOptions?.time,
      idle: this.options?.collectorOptions?.idle ?? 15 * 1000,
      max: this.options?.collectorOptions?.max,
      filter:
        this.options?.collectorOptions?.filter ??
        ((m) =>
          m.user.id ===
          (this.message instanceof Message
            ? this.message.author
            : this.message.user
          ).id),
    });
    collector.on('collect', async (i) => {
      switch (i.customId) {
        case this.options?.confirmButtonCustomId ?? 'confirm':
          if (this.options?.disableComponentsOnConfirm !== false)
            disableAllComponents(<Message>i.message);
          if (this.options?.deleteComponentsOnConfirm !== false)
            removeAllComponents(<Message>i.message);
          this.emit('confirm', i);
          break;
        case this.options?.denyButtonCustomId ?? 'deny':
          collector.stop();
          if (this.options?.disableComponentsOnDeny !== false)
            disableAllComponents(<Message>i.message);
          if (this.options?.deleteComponentsOnDeny !== false)
            removeAllComponents(<Message>i.message);
          this.emit('deny', i);
          break;
        default:
          break;
      }
    });
    collector.on('dispose', () => {
      disableAllComponents(msg);
    });
  }
}
