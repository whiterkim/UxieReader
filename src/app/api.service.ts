import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { create } from 'xmlbuilder2';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  public async GetBook(): Promise<string[]> {
    let data = await lastValueFrom(this.http.get('assets/book.txt', {responseType: 'text'}));
    return data.split('\n');
  }


  text: string = '';

  private getXmlBody(text: string): string {
    const xml_body = create()
        .ele('speak', { version: '1.0', xmlns: 'http://www.w3.org/2001/10/synthesis', 'xmlns:mstts': 'https://www.w3.org/2001/mstts', 'xml:lang': 'zh-CN'})
        .ele('voice', { name: 'zh-CN-YunxiNeural'})
        .txt(text)
        .end();

    return xml_body.toString();
  }

  public async TtsService(text: string): Promise<Blob> {
    const headers = {
      'Accept': '*/*',
      'Ocp-Apim-Subscription-Key': 'd0074ee2b178407291078b0e46fd342c',
      'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
      'Content-Type': 'application/ssml+xml',
    };

    const body = this.getXmlBody(text);
    console.log(body);

    return await lastValueFrom(this.http.post('https://westus2.tts.speech.microsoft.com/cognitiveservices/v1', body, {
      headers: headers,
      responseType: 'blob',
    }));
  }

  public Play(data: Blob) {
    const url = URL.createObjectURL(data);
    const audio = new Audio();
    audio.src = url;
    audio.load();
    audio.play().catch(function (error) {
        console.log(error.message);
    });
  }
}
