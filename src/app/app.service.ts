import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { create } from 'xmlbuilder2';
import { Book } from './model/book';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private http: HttpClient
  ) { }

  public async GetBook(): Promise<Book> {
    let rawText = await lastValueFrom(this.http.get('assets/books/NT10.txt', {responseType: 'text'}));
    let paragraphs = rawText.split('\n').filter(e => e !== '\r');

    let book: Book = {
      name: 'NT10',
      paragraphs: paragraphs,
      chapters: [],
    };

    this.GetChapters(book);

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

  private GetRequestXmlBody(text: string): string {
    const xml_body = create()
        .ele('speak', { version: '1.0', xmlns: 'http://www.w3.org/2001/10/synthesis', 'xmlns:mstts': 'https://www.w3.org/2001/mstts', 'xml:lang': 'zh-CN'})
        .ele('voice', { name: 'zh-CN-YunxiNeural'})
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
