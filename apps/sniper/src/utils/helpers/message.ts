import {
  APIEmbed,
  Colors,
  CommandInteraction,
  Embed,
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
  TextChannel,
  type ReplyMessageOptions,
} from 'discord.js';
import './message.js';
import { getUserData } from './user.js';

export const reply = async (
  message: Message | CommandInteraction,
  embed: Embed | APIEmbed | EmbedBuilder | string,
  otherOptions: ReplyMessageOptions = {},
  ephemeral?: boolean
): Promise<Message> => {
  let embedClone: EmbedBuilder = new EmbedBuilder();
  if (embed instanceof EmbedBuilder) embedClone = embed;
  else if (typeof embed === 'string')
    embed = EmbedBuilder.from({ title: embed });
  else if (embed instanceof Embed) embedClone = EmbedBuilder.from(embed);
  else embedClone = EmbedBuilder.from(embed);
  const author = message instanceof Message ? message.author : message.user;
  if (otherOptions.attachments || otherOptions.files) {
    if (
      !(message.channel as TextChannel)
        // eslint-disable-next-line
        .permissionsFor(message.guild!.members.me!)
        .has(PermissionFlagsBits.AttachFiles)
    ) {
      message.reply('I do not have permission to send files.');
      otherOptions.files = [];
      otherOptions.attachments = [];
    }
  }
  const { files, attachments, components, content, tts, nonce, stickers } =
    otherOptions;
  if (!embedClone.data.color) embedClone.setColor(Colors.White);
  if (embedClone.data.footer)
    embedClone.setFooter({
      text: 'Made by ||harry potter||#0014',
    });
  if (
    (message.channel as TextChannel)
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion -- You kind of have to do this
      .permissionsFor(message.guild!.members.me!)
      .has(PermissionFlagsBits.SendMessages) &&
    (message.channel as TextChannel)
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion
      .permissionsFor(message.guild!.members.me!)
      .has(PermissionFlagsBits.EmbedLinks)
  )
    return getUserData(author.id).then((userData) =>
      (
        message.reply({
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
          fetchReply: true,
          components,
          tts,
          failIfNotExists: false,
          nonce,
          stickers,
          //@ts-ignore
          ephemeral:
            ephemeral !== null || ephemeral !== undefined ? ephemeral : true,
        }) as Promise<Message>
      ).catch((err) => {
        console.error(err);
        return author.send('Something went wrong.') as Promise<Message>;
      })
    );
  else {
    return author.send("I can't send embeds in that channel.");
  }
};

export async function send(
  messageOrChannel: TextChannel,
  embed: APIEmbed | EmbedBuilder,
  otherOptions: ReplyMessageOptions
): Promise<TextChannel>;
export async function send(
  messageOrChannel: Message,
  embed: APIEmbed | EmbedBuilder,
  otherOptions: ReplyMessageOptions
): Promise<Message>;
export async function send(
  messageOrChannel: Message | TextChannel,
  embed: APIEmbed | EmbedBuilder,

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
  if (embed instanceof EmbedBuilder) embed = embed.toJSON();
  embed.color ||= Colors.White;
  if (messageOrChannel instanceof Message) {
    if (
      (messageOrChannel.channel as TextChannel)
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion -- You kind of have to do this
        .permissionsFor(messageOrChannel.guild?.members.me!)
        .has(PermissionFlagsBits.SendMessages)
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
        .permissionsFor(messageOrChannel.guild?.members.me!)
        .has(PermissionFlagsBits.SendMessages)
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
