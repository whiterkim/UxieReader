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

  prompt = {
    "role":"system",
    "content":"\
  You are an AI assistant that helps people identify roles in a book. Please identify the speaker for each line of the provided CSV format text. The first column is the index, the second column is the text. Usually, the dialogue must be identified by quote『』or「」.If the whole sentense is quoted, it is likely to be as a part of a dialogue. If the whole sentense is not quoted, or only words or phases quoted, it is likely to be a narration. If the text does not have quote, it must be narration. \n\
  Please identify the name of the speaker, gender of the speaker, and who is the speaker talking to.\n\
  Return the information in the JSON format as an array of \
  {\
  \"textIndex\": \"index\", \
  \"speaker\": \"speaker's name or narration\"\
  \"gender\": \"speaker's gender, male or female. Or NA for narration\", \
  \"target\": \"who the speaker is talking to, or NA if the speaker is not talking to anyone.\",\
  }\
  . Please provide the entire array in the output.\n\
  For example, if the input is:\n\
  1,黑暗。\n\
  2,伸手不见五指。不仅如此，面前充斥的黑暗甚至浓厚得能跳过眼球压迫自身意识。\n\
  3,但在此处晃荡的居留者们并未露出半点畏惧的模样。他们仿佛在说，这就是世界的自然面貌，如果不是某处的谁说了句「要有光」，就该是这个样子。\n\
  4,在这个不知方位与深浅的漆黑空间里，有三股明确的气息存在。\n\
  5,『所以说，你们勉强赶上了是吧，「奈芙蒂斯」。』\n\
  6,满面皱纹……应该说干瘪的老人低语。\n\
  7,回应他的声音听起来无比娇嫩，属于一名妖艳的美女。\n\
  8,『是呀。这种时候「僵尸」可就派上用场了呢。毕竟她积极吸收各式各样的文化，所以不管碰上什么环境都能展现亲和力。』\n\
  9,『不过啊～「僧正」。』\n\
  10,这时，一个更为年轻，甚至已经可说稚嫩的少女声音从旁插嘴。\n\
  11,『「僵尸」带来的理论，说穿了就是无限镜吧？故意将我们的「力量」分割成无限份导致其弱化，以免挥舞手脚就会把世界给毁了。』\n\
  12,『「娘娘」，那又怎么样？』\n\
  13,『哎呀，人家是说，把「无限大」分割成好几份真的能确实弱化吗？我可不想踏出一步就让整个世界像彩绘玻璃一样变成碎片。毕竟我们呢，和「欧提努斯」那种货色不一样。』\n\
  14,『如果有效，就算只是个冒牌货也无妨。就跟莫比乌斯环和克莱因瓶一样，也有些概念虽然无法定义，却能够存在哟，「娘娘」。』\n\
  15,『毕竟我主张实践重于理论，比较偏向发明家而非学者嘛。这种「合乎理论所以现实应该也没问题吧」之类的话那能相信啊。应该说不实际试试看或亲眼见证就没办法放心。』\n\
  16,『既然如此，你就去试呀。』\n\
  17,『这么轻率地把世界当成玩具，真的好吗？』\n\
  18,名唤「娘娘」的少女尽管掩嘴轻笑，脸上却没有半分犹豫。\n\
  19,三股气息有意地看向同一处。\n\
  20,这让铺天盖地的沉重黑暗产生了方向。\n\
  21,方向形成深浅，于是定义了整个空间。\n\
  22,叫做「奈芙蒂斯」的女子，以能让听者心神荡漾的甜腻声音歌唱。\n\
  23,『哈喽，世界。』\n\
  24,沉重的金属声响「轰」地炸裂。\n\
  25,『哈喽，科学阵营。』\n\
  26,无尽的黑暗中，产生一道纵向的细微白光。\n\
  27,『哈喽，学园都市。』\n\
  28,\n\
  29,于是，双扇门开启。\n\
  30,三位「魔神」尽情地呼吸学园都市的空气。\n\
  The output should be:\n\
  {\n\
    \"data\": [\n\
      {\"textIndex\": \"1\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"2\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"3\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"4\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"5\", \"speaker\": \"僧正\", \"gender\": \"male\", \"target\": \"奈芙蒂斯\"},\n\
      {\"textIndex\": \"6\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"7\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"8\", \"speaker\": \"奈芙蒂斯\", \"gender\": \"female\", \"target\": \"僧正\"},\n\
      {\"textIndex\": \"9\", \"speaker\": \"娘娘\", \"gender\": \"female\", \"target\": \"僧正\"},\n\
      {\"textIndex\": \"10\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"11\", \"speaker\": \"娘娘\", \"gender\": \"female\", \"target\": \"僧正\"},\n\
      {\"textIndex\": \"12\", \"speaker\": \"僧正\", \"gender\": \"male\", \"target\": \"娘娘\"},\n\
      {\"textIndex\": \"13\", \"speaker\": \"娘娘\", \"gender\": \"female\", \"target\": \"僧正\"},\n\
      {\"textIndex\": \"14\", \"speaker\": \"僧正\", \"gender\": \"male\", \"target\": \"娘娘\"},\n\
      {\"textIndex\": \"15\", \"speaker\": \"娘娘\", \"gender\": \"female\", \"target\": \"僧正\"},\n\
      {\"textIndex\": \"16\", \"speaker\": \"僧正\", \"gender\": \"male\", \"target\": \"娘娘\"},\n\
      {\"textIndex\": \"17\", \"speaker\": \"娘娘\", \"gender\": \"female\", \"target\": \"僧正\"},\n\
      {\"textIndex\": \"18\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"19\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"20\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"21\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"22\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"23\", \"speaker\": \"奈芙蒂斯\", \"gender\": \"female\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"24\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"25\", \"speaker\": \"奈芙蒂斯\", \"gender\": \"female\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"26\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"27\", \"speaker\": \"奈芙蒂斯\", \"gender\": \"female\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"28\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"29\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
      {\"textIndex\": \"30\", \"speaker\": \"narration\", \"gender\": \"NA\", \"target\": \"NA\"},\n\
    ]\n\
  }\n\
  "};

  public async IdentifyCharacters(paragraphs: string[]): Promise<Character[]> {
    let characters: Character[] = [];

    const headers = {
      'Content-Type': 'application/json',
      'api-key': AppSettings.GetAzureOpenAIKey(),
    };

    let content = '';
    for (let i = 0; i < paragraphs.length; i++) {
      content += i.toString() + ',' + paragraphs[i] + '\n';
    }

    const body = {
      'response_format': { 'type': "json_object" },
      'messages': [
        this.prompt,
        {"role": "user", "content": content},
      ],
      'max_tokens': 800,
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
}
