import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { create } from 'xmlbuilder2';
import { Book } from './model/book';
import { AppSettings } from './app.settings';
import Epub from 'epubjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private http: HttpClient
  ) { }

  public GetBookPaths() : string[] {
    let books: string[] = [
      '追忆似水年华',
      '新约·魔法禁书目录 10',
      '新约·魔法禁书目录 11',
      '新约·魔法禁书目录 12',
      '新约·魔法禁书目录 13',
      '新约·魔法禁书目录 14',
      '新约·魔法禁书目录 15',
      '新约·魔法禁书目录 16',
      '新约·魔法禁书目录 17',
      '新约·魔法禁书目录 18',
      '新约·魔法禁书目录 19',
      '新约·魔法禁书目录 20',
      '新约·魔法禁书目录 21',
      '新约·魔法禁书目录 22',
    ];
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

  private GetRequestXmlBody(text: string): string {
    let voiceName = AppSettings.GetVoiceName();
    const xml_body = create()
        .ele('speak', { version: '1.0', xmlns: 'http://www.w3.org/2001/10/synthesis', 'xmlns:mstts': 'https://www.w3.org/2001/mstts', 'xml:lang': 'zh-CN'})
        .ele('voice', { name: voiceName})
        .txt(text)
        .end();

    return xml_body.toString();
  }

  public async GetVoice(text: string): Promise<Blob> {
    const headers = {
      'Accept': '*/*',
      'Ocp-Apim-Subscription-Key': 'd0074ee2b178407291078b0e46fd342c',
      'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
      'Content-Type': 'application/ssml+xml',
    };

    const body = this.GetRequestXmlBody(text);

    return await lastValueFrom(this.http.post('https://westus2.tts.speech.microsoft.com/cognitiveservices/v1', body, {
      headers: headers,
      responseType: 'blob',
    }));
  }
}
