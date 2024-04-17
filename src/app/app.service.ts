import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { create } from 'xmlbuilder2';
import { Book } from './model/book';
import { AppSettings } from './app.settings';
import Epub from 'epubjs';
import { Character } from './model/character';
import { CharacterIdentification } from './character-identification';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private http: HttpClient
  ) { }

  public GetBookPaths() : string[] {
    let books: string[] = [
      '新约 某魔法的禁书目录 10X.epub',
      '新约 某魔法的禁书目录 11X.epub',
      '新约 某魔法的禁书目录 12X.epub',
      '新约 某魔法的禁书目录 13X.epub',
      '新约 某魔法的禁书目录 14X.epub',
      '新约 某魔法的禁书目录 15X.epub',
      '新约 某魔法的禁书目录 16X.epub',
      '新约 某魔法的禁书目录 17X.epub',
      '新约 某魔法的禁书目录 18X.epub',
      '新约 某魔法的禁书目录 19X.epub',
      '新约 某魔法的禁书目录 20X.epub',
      '新约 某魔法的禁书目录 21X.epub',
      '新约 某魔法的禁书目录 22X.epub',
      '新约 某魔法的禁书目录 22rX.epub',
      '当我谈跑步时，我在谈些什么.epub',
    ]
    return books;
  }

  public async LoadBook(bookName: string | undefined): Promise<Book | undefined> {
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

  public async LoadEpub(bookName: string | undefined): Promise<ePub.Book | undefined> {
    if (bookName) {
      localStorage.setItem('lastEpub', bookName);
      return this.GetEpub(bookName);
    }

    let lastBookName = localStorage.getItem('lastEpub');
    if (lastBookName) {
      return this.GetEpub(lastBookName);
    }
    return undefined;
  }

  private async GetBookWithName(name: string): Promise<Book> {
    let fullPath = 'assets/books/' + name + '.txt';
    let rawText = await lastValueFrom(this.http.get(fullPath, {responseType: 'text'}));
    let paragraphs = rawText.split('\n').filter(e => e !== '\r');

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
      if (paragraph[0] == '第' && (paragraph[2] == '章' || paragraph[3] == '章')) {
        book.chapters.push(index);
      }
      index++;
    }
  }

  private GetChaptersZ(book: Book): void {
    let index = 0;
    for (let paragraph of book.paragraphs) {
      if (paragraph[0] == '分' &&
        paragraph[1] == '节' &&
        paragraph[2] == '阅' &&
        paragraph[3] == '读') {
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

  private GetRequestXmlBody(text: string, character: Character ): string {
    let voiceName = AppSettings.GetVoiceName(character);
    const xml_body = create()
        .ele('speak', { version: '1.0', xmlns: 'http://www.w3.org/2001/10/synthesis', 'xmlns:mstts': 'https://www.w3.org/2001/mstts', 'xml:lang': 'zh-CN'})
        .ele('voice', { name: voiceName})
        .txt(text)
        .end();

    return xml_body.toString();
  }

  public async GetVoice(text: string, character: Character = CharacterIdentification.Default()): Promise<Blob> {
    const headers = {
      'Accept': '*/*',
      'Ocp-Apim-Subscription-Key': AppSettings.GetAzureCognitiveServiceKey(),
      'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
      'Content-Type': 'application/ssml+xml',
    };

    const body = this.GetRequestXmlBody(text, character);

    return await lastValueFrom(this.http.post('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1', body, {
      headers: headers,
      responseType: 'blob',
    })).catch(_ => {
      return {} as Promise<Blob>;
    });
  }

  public async IdentifyCharacters(availableCharacters: any[], paragraphs: string[]): Promise<Character[]> {
    let characters: Character[] = [];

    const headers = {
      'Content-Type': 'application/json',
      'api-key': AppSettings.GetAzureOpenAIKey(),
    };

    const content = JSON.stringify({
      characters: availableCharacters,
      texts: paragraphs,
    });

    const prompt = await lastValueFrom(this.http.get(
      'assets/identify-characters.prompt.txt',
      { responseType: 'text' }
    ));

    const body = {
      'response_format': { 'type': "json_object" },
      'messages': [
        {"role": "system", "content": prompt},
        {"role": "user", "content": content},
      ],
      'max_tokens': 1200,
      'temperature': 0.7,
      'frequency_penalty': 0,
      'presence_penalty': 0,
      'top_p': 0.95,
      'stop': null,
    }

    const response = await lastValueFrom(this.http.post('https://openaiazureservicewest.openai.azure.com/openai/deployments/DetectModelGPT4/chat/completions?api-version=2024-02-15-preview', body, {
      headers: headers,
      responseType: 'json',
    })).catch(_ => {
      return {} as Promise<any>;
    });

    // if response 400

    const message = response?.choices[0]?.message;

    // Convert message.content to JSON
    let data = JSON.parse(message.content);
    if (data.data.length !== paragraphs.length) {
      throw new Error('Data length mismatch');
    }

    for (let i = 0; i < paragraphs.length; i++) {
      let item = data.data[i];
      // Cast item to Character
      if (+item.textIndex !== i) {
        throw new Error('Index mismatch');
      }
      let character: Character = {
        textIndex: item.textIndex,
        speaker: item.speaker,
        gender: item.gender,
        target: item.target,
      };
      characters.push(character);
    }

    return characters;
  }

  public async ListCharacters(paragraphs: string[]): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      'api-key': AppSettings.GetAzureOpenAIKey(),
    };

    let content = '';
    for (let i = 0; i < paragraphs.length; i++) {
      content += i.toString() + ',' + paragraphs[i] + '\n';
    }

    const prompt = await lastValueFrom(this.http.get(
      'assets/list-characters.prompt.txt',
      { responseType: 'text' }
    ));

    const body = {
      'response_format': { 'type': "json_object" },
      'messages': [
        {"role": "system", "content": prompt},
        {"role": "user", "content": content},
      ],
      'max_tokens': 1200,
      'temperature': 0.7,
      'frequency_penalty': 0,
      'presence_penalty': 0,
      'top_p': 0.95,
      'stop': null,
    }

    const response = await lastValueFrom(this.http.post('https://openaiazureservicewest.openai.azure.com/openai/deployments/DetectModelGPT4/chat/completions?api-version=2024-02-15-preview', body, {
      headers: headers,
      responseType: 'json',
    })).catch(_ => {
      return {} as Promise<any>;
    });

    // if response 400

    const message = response?.choices[0]?.message;

    // Convert message.content to JSON
    let data = JSON.parse(message.content);
    console.log(data);
    return data;
  }
}
