import { Character } from "./model/character";

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

  public static GetVoiceName(character: Character): string {
    if (character.speaker === 'narration') {
      return AppSettings.VoiceList()[0];
    }
    
    if (character.gender === 'male') {
      return AppSettings.VoiceList()[1];
    }

    // female 1
    return AppSettings.VoiceList()[2];
  }

  private static GetVoiceIndex(): number {
    let savedVoiceIndex = localStorage.getItem('voiceIndex');
    if (savedVoiceIndex !== null) {
      return +savedVoiceIndex;
    }
    // Set Yunxi as the default voice.
    return 0;
  }

  private static SetVoiceIndex(index: number): void {
    localStorage.setItem('voiceIndex', index.toString());
  }

  private static VoiceList(): string[] {
    return [
      'zh-CN-XiaoxiaoMultilingualNeural', // narration
      'zh-CN-YunyiMultilingualNeural', // male
      'zh-CN-XiaoxiaoMultilingualNeural', // female 1
      'zh-CN-XiaochenMultilingualNeural', // female 2
      // xiaoyu
    ]
  }

  public static SetPreviousVoice(): void {
    let length = AppSettings.VoiceList().length;
    let currentIndex = AppSettings.GetVoiceIndex();
    let newIndex = (currentIndex + length - 1) % length;
    AppSettings.SetVoiceIndex(newIndex);
  }

  public static SetNextVoice(): void {
    let length = AppSettings.VoiceList().length;
    let currentIndex = AppSettings.GetVoiceIndex();
    let newIndex = (currentIndex + 1) % length;
    AppSettings.SetVoiceIndex(newIndex);
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
