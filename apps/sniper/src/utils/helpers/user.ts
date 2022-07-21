import { GuildMember, PermissionFlagsBits, User } from 'discord.js';
import { FieldValue } from 'firebase-admin/firestore';
import type { DiscordClient } from '../../client/client.js';
import { db } from '../../sniper.js';
export interface UserData {
  coins: number;
  inJailUntil: number;
  items: Array<UserItem>;
  settings: UserSettings;
  tag: `${string}#${string}`;
}
interface UserItem {
  name: string;
  amount: number;
}
export interface UserSettings {
  [setting: string]: {
    value: boolean | 'true' | 'false' | any;
    description: string;
  };
}

export const isAdmin = (
  client: DiscordClient,
  guildID: string,
  userID: string | User | GuildMember
): boolean | undefined => {
  if (typeof userID === 'string') {
    return client.guilds.cache
      .get(guildID)
      ?.members.cache.get(userID)
      ?.permissions.has(PermissionFlagsBits.ManageGuild);
  } else {
    return client.guilds.cache
      .get(guildID)
      ?.members.cache.get(userID.id)
      ?.permissions.has(PermissionFlagsBits.ManageGuild);
  }
};

export const addCoinsToTotal = async (
  userID: string,
  addedCoins: number
): Promise<number> => {
  return db
    .collection('users')
    .doc(userID)
    .get()
    .then(
      async (
        stuff: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
      ) => {
        const coins: number = stuff.data()?.coins ? stuff.data()?.coins : 0;
        await db
          .collection('users')
          .doc(userID)
          .set(
            {
              coins: coins + addedCoins,
            },
            { merge: true }
          );
        return coins + addedCoins;
      }
    );
};

export const getTotalCoins = async (userID: string): Promise<number> => {
  const stuff = await db.collection('users').doc(userID).get();
  return stuff.data()?.coins ? stuff.data()?.coins : 0;
};
export const getUserData = async (userID: string): Promise<UserData> => {
  const stuff = await db.collection('users').doc(userID).get();
  return stuff.data() as UserData;
};

export const getUserDataRef = (
  userID: string
): Promise<FirebaseFirestore.DocumentSnapshot<any>> => {
  return db.collection('users').doc(userID).get();
};

export const setUserData = (
  userID: string,
  data: Partial<FirebaseFirestore.DocumentData>,
  options: FirebaseFirestore.SetOptions = { merge: true }
): Promise<FirebaseFirestore.WriteResult> => {
  return db.collection('users').doc(userID).set(data, options);
};

export const deleteFieldFromUserData = (userID: string, fields: string[]) => {
  const keyDelete: { [field: string]: FieldValue } = {};
  fields.forEach((field) => {
    keyDelete[field] = FieldValue.delete();
  });
  return db.collection('users').doc(userID).update(keyDelete);
};

/**
 *
 * @param userID
 * @param amount amount of coins to set
 * @returns the amount of coins the user has
 */
export const setTotalCoins = async (
  userID: string,
  amount: number
): Promise<number> => {
  const total = await getTotalCoins(userID);
  return setTotalCoins(userID, total + amount);
};
