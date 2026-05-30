import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { create } from 'xmlbuilder2';
import { Book } from './model/book';
import { AppSettings } from './app.settings';
import Epub from 'epubjs';
import { Speaker } from './model/speaker';
import { SpeakerIdentification } from './speaker-identification';
import { Character } from './model/character';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private http: HttpClient) {}

  public async LoadBook(
    bookName: string | undefined,
  ): Promise<Book | undefined> {
    if (bookName) {
      localStorage.setItem('lastBook', bookName);
      return await this.GetBookWithName(bookName);
    }

    let lastBookName = localStorage.getItem('lastBook');
    if (lastBookName) {
      // Get last read book
      return await this.GetBookWithName(lastBookName);
    }

    return undefined;
  }

  private async GetBookWithName(name: string): Promise<Book> {
    let fullPath = 'assets/books/' + name + '.txt';
    let rawText = await lastValueFrom(
      this.http.get(fullPath, { responseType: 'text' }),
    );
    let paragraphs = rawText.split('\n').filter((e) => e !== '\r');

    let book: Book = {
      name: name,
      paragraphs: paragraphs,
      chapters: [],
    };

    if (name[0] == '追') {
      this.GetChaptersZ(book);
    } else {
      this.GetChapters(book);
    }
    return book;
  }

  private GetChapters(book: Book): void {
    let index = 0;
    for (let paragraph of book.paragraphs) {
      if (paragraph[0] == '后' && paragraph[1] == '记') {
        book.chapters.push(index);
        break;
      }
      if (
        paragraph[0] == '第' &&
        (paragraph[2] == '章' || paragraph[3] == '章')
      ) {
        book.chapters.push(index);
      }
      index++;
    }
  }

  private GetChaptersZ(book: Book): void {
    let index = 0;
    for (let paragraph of book.paragraphs) {
      if (
        paragraph[0] == '分' &&
        paragraph[1] == '节' &&
        paragraph[2] == '阅' &&
        paragraph[3] == '读'
      ) {
        book.chapters.push(index);
      }
      index++;
    }
  }

  public GetEpub(name: string): ePub.Book {
    let fullPath = 'assets/books/' + name;
    var book = Epub(fullPath);
    return book;
  }

  public async GetEpubCoverUrl(name: string): Promise<string | undefined> {
    let fullPath = 'assets/books/' + name;
    if (!fullPath.endsWith('.epub')) {
      fullPath += '.epub';
    }

    const book = Epub(fullPath);
    await book.ready;
    // epub.js v0.3+ provides coverUrl(), otherwise use book.archive.cover
    if (typeof book.coverUrl === 'function') {
      const urlOrPromise = book.coverUrl();
      if (urlOrPromise instanceof Promise) {
        const url = await urlOrPromise;
        return url === null ? undefined : url;
      } else {
        return urlOrPromise === null ? undefined : urlOrPromise;
      }
    }
    return undefined;
  }

  private GetRequestXmlBody(text: string, speaker: Speaker): string {
    const characterVoice = AppSettings.GetVoiceForSpeaker(speaker);
    const root = create()
      .ele('speak', {
        version: '1.0',
        xmlns: 'http://www.w3.org/2001/10/synthesis',
        'xmlns:mstts': 'https://www.w3.org/2001/mstts',
        'xml:lang': 'zh-CN',
      })
      .ele('voice', { name: characterVoice.value });

    // Add express-as element
    if (characterVoice.style || characterVoice.role) {
      const expressAsAttributes: any = {};
      if (characterVoice.style) {
        expressAsAttributes.style = characterVoice.style;
      }
      if (characterVoice.role) {
        expressAsAttributes.role = characterVoice.role;
      }
      root.ele('mstts:express-as', expressAsAttributes);
    }

    // Add text content
    root.txt(text).end();

    const xml_body = root.end({ prettyPrint: true });
    return xml_body;
  }

  public async GetVoice(
    text: string,
    speaker: Speaker = SpeakerIdentification.Default(),
  ): Promise<Blob> {
    const headers = {
      Accept: '*/*',
      'Ocp-Apim-Subscription-Key': AppSettings.GetAzureCognitiveServiceKey(),
      'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
      'Content-Type': 'application/ssml+xml',
    };

    const body = this.GetRequestXmlBody(text, speaker);

    return await lastValueFrom(
      this.http.post(
        'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1',
        body,
        {
          headers: headers,
          responseType: 'blob',
        },
      ),
    ).catch((_) => {
      return {} as Promise<Blob>;
    });
  }

  public async IdentifySpeakersFake(
    availableCharacters: any[],
    paragraphsBefore: string[],
    paragraphs: string[],
    paragraphsAfter: string[],
  ): Promise<Speaker[]> {
    return [
      {
        textIndex: 0,
        name: 'narration',
        gender: 'NA',
        target: 'NA',
      },
      {
        textIndex: 1,
        name: 'narration',
        gender: 'NA',
        target: 'NA',
      },
      {
        textIndex: 2,
        name: '史蒂芬妮·葛洁帕蕾丝',
        gender: 'female',
        target: 'NA',
      },
      {
        textIndex: 3,
        name: '滨面仕上',
        gender: 'male',
        target: 'NA',
      },
      {
        textIndex: 4,
        name: '滨面仕上',
        gender: 'male',
        target: '史蒂芬妮·葛洁帕蕾丝',
      },
      {
        textIndex: 5,
        name: '史蒂芬妮·葛洁帕蕾丝',
        gender: 'female',
        target: '滨面仕上',
      },
      {
        textIndex: 6,
        name: '滨面仕上',
        gender: 'male',
        target: '史蒂芬妮·葛洁帕蕾丝',
      },
      {
        textIndex: 7,
        name: '史蒂芬妮·葛洁帕蕾丝',
        gender: 'female',
        target: 'NA',
      },
      {
        textIndex: 8,
        name: '滨面仕上',
        gender: 'male',
        target: '史蒂芬妮·葛洁帕蕾丝',
      },
      {
        textIndex: 9,
        name: '史蒂芬妮·葛洁帕蕾丝',
        gender: 'female',
        target: '滨面仕上',
      },
    ];
  }

  private GetTextElementArray(texts: string[]): {
    index: number;
    isNarration: boolean;
    text: string;
  }[] {
    let elements: any[] = [];
    for (let i = 0; i < texts.length; i++) {
      const isSpeech =
        (texts[i][0] == '「' && texts[i][texts[i].length - 1] == '」') ||
        (texts[i][0] == '『' && texts[i][texts[i].length - 1] == '』') ||
        (texts[i][0] == '（' && texts[i][texts[i].length - 1] == '）');
      elements.push({
        index: i,
        isNarration: !isSpeech,
        text: texts[i],
      });
    }
    return elements;
  }

  private GetResponseOutputText(response: any): string {
    if (typeof response?.output_text === 'string') {
      return response.output_text.trim();
    }

    const output = response?.output;
    if (!Array.isArray(output)) {
      return '';
    }

    const messageText = this.GetTextFromResponseOutputItems(
      output.filter((item: any) => item?.type === 'message'),
    );
    if (messageText) {
      return messageText.trim();
    }

    return this.GetTextFromResponseOutputItems(output).trim();
  }

  private GetTextFromResponseOutputItems(outputItems: any[]): string {
    const textParts: string[] = [];

    for (const outputItem of outputItems) {
      if (typeof outputItem?.text === 'string') {
        textParts.push(outputItem.text);
      }

      const content = outputItem?.content;
      if (typeof content === 'string') {
        textParts.push(content);
        continue;
      }

      if (!Array.isArray(content)) {
        continue;
      }

      for (const contentItem of content) {
        if (typeof contentItem === 'string') {
          textParts.push(contentItem);
        } else if (typeof contentItem?.text === 'string') {
          textParts.push(contentItem.text);
        } else if (typeof contentItem?.content === 'string') {
          textParts.push(contentItem.content);
        }
      }
    }

    return textParts.join('\n');
  }

  public async IdentifySpeakers(
    availableCharacters: any[],
    paragraphsBefore: string[],
    paragraphs: string[],
    paragraphsAfter: string[],
  ): Promise<Speaker[]> {
    let speakers: Speaker[] = [];

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AppSettings.GetAzureOpenAIKey()}`,
    };

    const textElements = this.GetTextElementArray(paragraphs);

    const content = JSON.stringify({
      characters: availableCharacters,
      textsBefore: this.GetTextElementArray(paragraphsBefore),
      texts: textElements,
      textsAfter: this.GetTextElementArray(paragraphsAfter),
    });

    const prompt = await lastValueFrom(
      this.http.get('assets/identify-speakers.prompt.md', {
        responseType: 'text',
      }),
    );

    const body = {
      input: [
        { role: 'system', content: prompt },
        { role: 'user', content: content },
      ],
      max_output_tokens: 16384,
      model: 'gpt-chat-latest',
      text: { format: { type: 'json_object' } },
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    const response = await lastValueFrom(
      this.http.post(
        'https://white-mpsks5mt-eastus2.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview',
        body,
        {
          headers: headers,
          responseType: 'json',
        },
      ),
    ).catch((_) => {
      return {} as Promise<any>;
    });

    // if response 400

    const responseText = this.GetResponseOutputText(response);

    // Convert response text to JSON
    let data = JSON.parse(responseText);

    for (let i = 0; i < paragraphs.length; i++) {
      const item = data.speakers.find((item: any) => +item.index === i);
      if (!textElements[i].isNarration && item) {
        speakers.push({
          textIndex: i,
          name: item.name,
          gender: item.gender,
          target: item.target,
        });
      } else {
        speakers.push({
          textIndex: i,
          name: 'narration',
          gender: 'NA',
          target: 'NA',
        });
      }
    }

    console.log('Data:', data);
    console.log('Identified speakers:', speakers);

    return speakers;
  }

  public async ListCharactersFake(paragraphs: string[]): Promise<Character[]> {
    return [
      {
        name: '御坂美琴',
        gender: 'female',
        alias: ['美琴', '姐姐大人'],
        features: ['茶色长发', '常盘台中学', '十亿伏特的雷击枪'],
      },
      {
        name: '初春饰利',
        gender: 'female',
        alias: ['初春'],
        features: ['头上戴满了花饰', '少女'],
      },
      {
        name: '佐天泪子',
        gender: 'female',
        alias: ['佐天'],
        features: ['黑发垂及肩部', '头上戴着一朵花', '活泼少女'],
      },
      {
        name: '白井黑子',
        gender: 'female',
        alias: ['黑子'],
        features: ['双马尾'],
      },
    ];
  }

  public async ListCharacters(paragraphs: string[]): Promise<Character[]> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AppSettings.GetAzureOpenAIKey()}`,
    };

    let content = '';
    for (let i = 0; i < paragraphs.length; i++) {
      content += i.toString() + ',' + paragraphs[i] + '\n';
    }

    const prompt = await lastValueFrom(
      this.http.get('assets/list-characters.prompt.md', {
        responseType: 'text',
      }),
    );

    const body = {
      input: [
        { role: 'system', content: prompt },
        { role: 'user', content: content },
      ],
      max_output_tokens: 16384,
      model: 'gpt-chat-latest',
      text: { format: { type: 'json_object' } },
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    const response = await lastValueFrom(
      this.http.post(
        'https://white-mpsks5mt-eastus2.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview',
        body,
        {
          headers: headers,
          responseType: 'json',
        },
      ),
    ).catch((_) => {
      return {} as Promise<any>;
    });

    // if response 400

    const responseText = this.GetResponseOutputText(response);

    // Convert response text to JSON
    let data = JSON.parse(responseText);

    const characters: Character[] = [];
    for (let item of data.characters) {
      const character: Character = {
        name: item.name,
        gender: item.gender,
        alias: item.alias,
        features: item.features,
      };
      characters.push(character);
    }
    return characters;
  }

  public async GetTranslation(text: string): Promise<string> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AppSettings.GetAzureOpenAIKey()}`,
    };

    const prompt = await lastValueFrom(
      this.http.get('assets/translate-text.prompt.md', {
        responseType: 'text',
      }),
    );

    const content = `Translate to zh (simplified Chinese) (output translation only):\n${text}`;

    const body = {
      input: [
        { role: 'system', content: prompt },
        { role: 'user', content: content },
      ],
      max_output_tokens: 16384,
      model: 'gpt-chat-latest',
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    try {
      const response: any = await lastValueFrom(
        this.http.post(
          'https://white-mpsks5mt-eastus2.cognitiveservices.azure.com/openai/responses?api-version=2025-04-01-preview',
          body,
          {
            headers: headers,
            responseType: 'json',
          },
        ),
      );

      return this.GetResponseOutputText(response);
    } catch (e) {
      return '';
    }
  }
}
