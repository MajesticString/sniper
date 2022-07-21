import type { APIEmbed } from 'discord-api-types/v10';
import {
  Message,
  MessageEmbed,
  TextChannel,
  type MessageEmbedOptions,
  type ReplyMessageOptions,
} from 'discord.js';
import './message.js';
import randomNumber from './randomNumber.js';
import { getUserData } from './user.js';

const ads: string[] = [
  'Join our support server for bot updates and support: https://discord.gg/wsEHfhzk54',
  'This bot also has an (almost) full currency system. Check out the currency page of the help command for more info.',
];

export const reply = async (
  message: Message,
  embed: MessageEmbed | MessageEmbedOptions | APIEmbed | string,
  otherOptions: ReplyMessageOptions = {},
  ephemeral?: boolean
): Promise<Message> => {
  if (typeof embed === 'string') embed = { title: embed };
  const ad = false;
  if (otherOptions.attachments || otherOptions.files) {
    if (
      !(message.channel as TextChannel)
        // eslint-disable-next-line
        .permissionsFor(message.guild!.members.me!)
        .has('ATTACH_FILES')
    ) {
      message.reply('I do not have permission to send files.');
      otherOptions.files = [];
      otherOptions.attachments = [];
    }
  }
  const { files, attachments, components, content, tts, nonce, stickers } =
    otherOptions;
  embed.color ||= 'WHITE';
  if (embed.footer) embed.footer.text ||= 'Made by ||harry potter||#0014';
  if (
    (message.channel as TextChannel)
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion -- You kind of have to do this
      .permissionsFor(message.guild!.members.me!)
      .has('SEND_MESSAGES') &&
    (message.channel as TextChannel)
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion
      .permissionsFor(message.guild!.members.me!)
      .has('EMBED_LINKS')
  )
    return getUserData(message?.author?.id || message.member?.id || '').then(
      (userData) =>
        message.type !== 'APPLICATION_COMMAND'
          ? message.reply({
              // @ts-ignore
              embeds: [embed],
              allowedMentions: {
                repliedUser: userData?.settings?.mentionAuthorOnReply
                  ? userData.settings?.mentionAuthorOnReply?.value
                  : true,
              },
              files,
              attachments,
              content:
                content || ad ? ads[randomNumber(0, ads.length - 1)] : null,
              components,
              tts,
              failIfNotExists: false,
              nonce,
              stickers,
            })
          : message
              .reply({
                // @ts-ignore
                embeds: [embed],
                allowedMentions: {
                  repliedUser: userData?.settings?.mentionAuthorOnReply
                    ? userData.settings?.mentionAuthorOnReply?.value
                    : true,
                },
                files,
                attachments,
                content,
                components,
                tts,
                failIfNotExists: false,
                nonce,
                stickers,
                //@ts-ignore
                ephemeral:
                  ephemeral !== null || ephemeral !== undefined
                    ? ephemeral
                    : true,
              })
              .catch((err) => {
                console.error(err);
                return message.author.send('Something went wrong.');
              })
    );
  else {
    return message.author.send("I can't send embeds in that channel.");
  }
};

export async function send(
  messageOrChannel: TextChannel,
  embed: MessageEmbed | MessageEmbedOptions,
  otherOptions: ReplyMessageOptions
): Promise<TextChannel>;
export async function send(
  messageOrChannel: Message,
  embed: MessageEmbed | MessageEmbedOptions,
  otherOptions: ReplyMessageOptions
): Promise<Message>;
export async function send(
  messageOrChannel: Message | TextChannel,
  embed: MessageEmbed | MessageEmbedOptions,

  otherOptions: ReplyMessageOptions = {}
): Promise<Message | TextChannel | undefined> {
  const {
    files,
    attachments,
    components,
    content,
    tts,

    nonce,
    stickers,
  } = otherOptions;
  embed.color ||= 'WHITE';
  if (messageOrChannel instanceof Message) {
    if (
      (messageOrChannel.channel as TextChannel)
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion -- You kind of have to do this
        .permissionsFor(messageOrChannel.guild!.members.me!)
        .has('SEND_MESSAGES')
    )
      return messageOrChannel.channel.send({
        embeds: [embed],

        files,
        attachments,
        content,
        components,
        tts,

        nonce,
        stickers,
      });
    else {
      return messageOrChannel.author.send(
        "I can't send messages in that channel."
      );
    }
  } else if (messageOrChannel instanceof TextChannel) {
    if (
      messageOrChannel
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion -- You kind of have to do this
        .permissionsFor(messageOrChannel.guild!.members.me!)
        .has('SEND_MESSAGES')
    ) {
      const sentMessage = messageOrChannel.send({
        embeds: [embed],

        files,
        attachments,
        content,
        components,
        tts,

        nonce,
        stickers,
      });
      sentMessage.catch((err) => console.error(err));
      return sentMessage;
    }
  }
}
