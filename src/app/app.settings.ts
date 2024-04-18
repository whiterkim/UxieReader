import { Speaker } from "./model/speaker";

export class AppSettings {
  constructor(bookName: string) {
    this.bookName = bookName;
  }

  bookName: string = '';

  public GetCounter(): number {
    let savedCounter = localStorage.getItem(this.bookName + 'counter');
    if (savedCounter !== null) {
      return +savedCounter;
    }
    // Start from beginning when no saved counter found.
    return 0;
  }

  public SetCounter(counter: number): void {
    localStorage.setItem(this.bookName + 'counter', counter.toString());
  }

  public GetEpubCounter(): number {
    let savedCounter = localStorage.getItem(this.bookName + '_epub_counter');
    if (savedCounter !== null) {
      return +savedCounter;
    }
    // Start from beginning when no saved counter found.
    return 0;
  }

  public SetEpubCounter(counter: number): void {
    localStorage.setItem(this.bookName + '_epub_counter', counter.toString());
  }

  public GetEpubCfi(): string | undefined {
    let savedEpubCfi = localStorage.getItem(this.bookName + '_epub_cfi');
    if (savedEpubCfi !== null) {
      return savedEpubCfi;
    }
    return undefined;
  }

  public SetEpubCfi(cfi: string): void {
    localStorage.setItem(this.bookName + '_epub_cfi', cfi);
  }

  // Static methods
  public static GetTextSize(): number {
    let savedSize = localStorage.getItem('textSize');
    if (savedSize !== null) {
        return +savedSize;
    }
    // Set the default size to 1rem.
    return 1;
  }

  public static SetTextSize(size: number): void {
    localStorage.setItem('textSize', size.toString());
  }

  public static GetVoiceName(speaker: Speaker): string {
    let role = 'narration';
    if (speaker.speaker !== 'narration') {
      role = speaker.gender;
    }
    return AppSettings.GetVoice(role);
  }

  public static GetVoice(role: string): string {
    let savedVoice = localStorage.getItem(role);
    if (savedVoice !== null) {
      return savedVoice;
    }
    // Set Yunxi as the default voice.
    return AppSettings.VoiceList()[0];
  }

  public static SetVoice(role: string, voice: string): void {
    localStorage.setItem(role, voice);
  }

  public static VoiceList(): string[] {
    return [
      'zh-CN-YunyiMultilingualNeural',
      'zh-CN-XiaochenMultilingualNeural',
      'zh-CN-XiaoyuMultilingualNeural',
      'zh-CN-XiaoxiaoMultilingualNeural',
      'zh-CN-XiaoxiaoNeural',
      'zh-CN-YunxiNeural',
      'zh-CN-YunjianNeural',
      'zh-CN-XiaoyiNeural',
      'zh-CN-YunyangNeural',
      'zh-CN-XiaochenNeural',
      'zh-CN-XiaohanNeural',
      'zh-CN-XiaomengNeural',
      'zh-CN-XiaomoNeural',
      'zh-CN-XiaoqiuNeural',
      'zh-CN-XiaoruiNeural',
      'zh-CN-XiaoshuangNeural',
      'zh-CN-XiaoyanNeural',
      'zh-CN-XiaoyouNeural',
      'zh-CN-XiaozhenNeural',
      'zh-CN-YunfengNeural',
      'zh-CN-YunhaoNeural',
      'zh-CN-YunxiaNeural',
      'zh-CN-YunyeNeural',
      'zh-CN-YunzeNeural',
      'zh-CN-XiaorouNeural',
      'zh-CN-YunjieNeural',
      'zh-CN-XiaoxuanNeural',
    ]
  }

  public static GetAzureCognitiveServiceKey(): string {
    let savedAzureCognitiveServiceKey = localStorage.getItem('azure-cognitive-service-key');
    if (savedAzureCognitiveServiceKey !== null) {
      return savedAzureCognitiveServiceKey;
    }
    return '';
  }

  public static GetAzureOpenAIKey(): string {
    let savedAzureOpenAIKey = localStorage.getItem('azure-openai-key');
    if (savedAzureOpenAIKey !== null) {
      return savedAzureOpenAIKey;
    }
    return '';
  }

  public static SetCognitiveServiceAzureKey(key: string): void {
    localStorage.setItem('azure-cognitive-service-key', key);
  }

  public static SetAzureOpenAIKey(key: string): void {
    localStorage.setItem('azure-openai-key', key);
  }
}
