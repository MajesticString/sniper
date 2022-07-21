import { Colors, Message } from 'discord.js';
import type { DiscordClient } from '../../client/client.js';
import type { MWResponse, OxfordRes } from '../../typings/types.js';
import { fetch } from '../../utils/helpers/fetch.js';
import { reply } from '../../utils/helpers/message.js';
import { BaseCommand } from '../../utils/structures/BaseCommand.js';

export default class DefineCommand extends BaseCommand {
  constructor() {
    super('define', 'general', [], 1000, 'Gets a definition', {
      argsDescription:
        '<word or term> [dictionary to use (can be oxford, urban, or mw (which stands for Merriam Webster)). Defaults to Oxford]',
    });
  }

  async run(client: DiscordClient, message: Message, args: Array<string>) {
    const { apiKeys } = (await import('../../sniper.js')).slappeyJSON;
    if (!args[0]) {
      reply(message, {
        title: 'You must specify a search term',
        color: Colors.Red,
      });
      return;
    }

    let defaultDictionary = 'mw';
    message.channel.sendTyping();
    if (
      (args[1] && args[1].toLowerCase() === 'oxford') ||
      (args[1] && args[1].toLowerCase() === 'urban')
    ) {
      defaultDictionary = args[1];
    }
    if (args[2]) {
      defaultDictionary = 'oxford';
    }

    try {
      if (defaultDictionary === 'oxford') {
        // const lemmas = await axios.get<any>(
        //   `https://od-api.oxforddictionaries.com/api/v2/lemmas/en-us/${args[0]}`,
        //   {
        //     headers: {
        //       app_id: apiKeys.oxford.appId,
        //       app_key: apiKeys.oxford.appKey,
        //     },
        //   }
        // );
        // const lemmaData = lemmas.data;
        // const searchTerm =
        //   lemmaData.results[0]?.lexicalEntries?.inflictionOf[0]?.text;
        // if (!searchTerm) {
        //   reply(message, {
        //     title: "That word wasn't found",
        //     description: 'Try again with a different search term.',
        //     color: Colors.Red,
        //   });
        // }
        const data = await fetch<OxfordRes>(
          `https://od-api.oxforddictionaries.com/api/v2/entries/${
            encodeURIComponent(args[2]) || 'en-us'
          }/${encodeURIComponent(
            args[0]
          ).toLowerCase()}?fields=definitions,examples,pronunciations`,
          {
            headers: {
              app_id: apiKeys.oxford.appId,
              app_key: apiKeys.oxford.appKey,
            },
          }
        );

        if (data) {
          const json = data;
          const examples =
            json.results[0].lexicalEntries[0].entries[0].senses[0].examples;
          let examplesValue = '';
          if (examples)
            examples.forEach((example) => {
              examplesValue += `${example.text}\n`;
            });
          reply(
            message,
            {
              title: `[${json.results[0].lexicalEntries[0].lexicalCategory.id}] ${json.word}`,
              fields: [
                {
                  name: 'Definition',
                  value: `${json.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0]}`,
                },
                {
                  name: 'Examples',
                  value:
                    examplesValue === '' ? 'No examples found' : examplesValue,
                },
              ],
            },
            {
              files: [
                {
                  attachment: json.results[0].lexicalEntries[0]?.entries[0]
                    ?.pronunciations
                    ? json.results[0].lexicalEntries[0]?.entries[0]
                        ?.pronunciations[1].audioFile
                    : 'https://www.google.com/speech-api/v1/synthesize?text=nothing.&enc=mpeg&lang=en-us&speed=0.4&client=lr-language-tts&use_google_only_voices=1',
                  name: 'pron.mp3',
                },
              ],
            }
          );
        }
      } else if (defaultDictionary === 'urban') {
        const data = await fetch<SomeResIDK>(
          `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(
            args[0]
          )}`
        );
        interface SomeResIDK {
          list: Array<{
            definition: string;
            permalink: string;
            thumbs_up: number;
            sound_urls: Array<any>;
            author: string;
            word: string;
            written_on: string;
            example: string;
            thumbs_down: number;
          }>;
        }
        const json = data;

        reply(message, {
          title: `Definition of ${json.list[0].word}`,
          description: `From Urban Dictionary\nPermalink: ${json.list[0].permalink}`,
          fields: [
            {
              name: 'Definition',
              value: `${json.list[0].definition}`,
            },
            { name: 'Example', value: json.list[0].example },
          ],
          footer: {
            text: `Thumbs up: ${json.list[0].thumbs_up}\nThumbs down: ${json.list[0].thumbs_down}\nAuthor: ${json.list[0].author}`,
          },
        });
      } else if (defaultDictionary === 'mw') {
        const data = await fetch<MWResponse[]>(
          `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(
            args[0]
          )}?key=${apiKeys.mw.apiKey}`
        );
        const json = data;
        // no word found
        if (!json[0]) {
          reply(message, {
            title: "Couldn't find that word",
            description: 'try again with a different term',
            color: Colors.Red,
          });
        } else if (typeof json[0] === 'string') {
          reply(message, {
            title: "Couldn't find that word",
            description: `Did you mean one of these?\n${json}`,
          });
        } else {
          reply(
            message,
            {
              title: `[${json[0].fl}] ${json[0].hwi.hw.replaceAll('*', '•')}`,
              fields: [
                {
                  name: 'Definitions',
                  value: json[0].shortdef.map((val) => `\n${val}`).toString(),
                },
              ],
            },
            {
              files: [
                {
                  attachment: `https://media.merriam-webster.com/audio/prons/en/us/mp3/${
                    json[0].hwi.prs[0].sound.audio.startsWith('bix')
                      ? 'bix'
                      : json[0].hwi.prs[0].sound.audio.startsWith('gg')
                      ? 'gg'
                      : json[0].hwi.prs[0].sound.audio
                          .charAt(0)
                          .toLowerCase() ===
                        json[0].hwi.prs[0].sound.audio.charAt(0).toUpperCase()
                      ? 'number'
                      : json[0].hwi.prs[0].sound.audio.charAt(0)
                  }/${json[0].hwi.prs[0].sound.audio}.mp3`,
                  name: 'pron.mp3',
                },
              ],
            }
          );
        }
      }
    } catch (error) {
      reply(
        message,
        {
          title: 'Something went wrong.',
          description:
            'Make sure that word exists, that language code (if you are using it) exists, or maybe try an alternate spelling.',
          color: Colors.Red,
        },
        {
          files: [
            {
              attachment: `https://www.google.com/speech-api/v1/synthesize?text=${
                args[0] ? encodeURIComponent(args[0]) : 'aaaaaaa'
              }&enc=mpeg&lang=en&speed=0.5&client=lr-language-tts&use_google_only_voices=1`,
              name: 'pron.mp3',
            },
          ],
        }
      );
    }
  }
}
