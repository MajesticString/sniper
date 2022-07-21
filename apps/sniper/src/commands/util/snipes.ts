import type {
  Embed,
  Emoji,
  GuildEmoji,
  Message,
  PartialUser,
  ReactionEmoji,
  User,
} from 'discord.js';

export type UniversalEmoji = GuildEmoji | ReactionEmoji | Emoji;
interface SnipeContent {
  author?: User;
  content?: string;
  createdAt: number | null;
  attachment?: string;
  attachments?: string[];
  id?: string;
  emoji?: UniversalEmoji;
  messageURL?: string;
  user?: User | PartialUser;
  message?: Message;
  requesterId?: string;
  embeds?: Embed[];
  cmdId: string;
}

export interface Snipe {
  [channelId: string]: SnipeContent;
}
interface UnSnipe {
  [channelID: string]: UnSnipeContent;
}
interface UnSnipeContent {
  [msg: string]: Message;
}

export const snipes: Snipe = {};
export const editSnipes: Snipe = {};
export const reactionSnipes: Snipe = {};
export const unSnipes: UnSnipe = {};
