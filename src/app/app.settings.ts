import { Character } from "./model/character";
import { Speaker } from "./model/speaker";
import { Voice } from "./model/voice";

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

  public static GetVoice(speaker: Speaker): Voice {
    const characterVoice = AppSettings.GetCharacterVoice(speaker.speaker);
    if (characterVoice !== undefined) {
      return characterVoice;
    }

    const defaultVoice = AppSettings.GetDefaultVoice(speaker);
    return defaultVoice;
  }

  public static GetDefaultVoice(speaker: Speaker): Voice {
    let role = 'narration';
    if (speaker.speaker !== 'narration') {
      role = speaker.gender;
    }
    return AppSettings.GetDefaultVoiceForRole(role);
  }

  public static GetDefaultVoiceForRole(role: string): Voice {
    return AppSettings.GetCharacterVoice(role) ?? AppSettings.VoiceList()[0];
  }

  public static GetCharacterVoice(role: string): Voice | undefined {
    let savedVoiceValue = localStorage.getItem(role);
    return AppSettings.VoiceList().find(
      (voice) => voice.value === savedVoiceValue);
  }

  public static SetVoice(role: string, voice: Voice): void {
    localStorage.setItem(role, voice.value);
  }

  public static VoiceList(): Voice[] {
    return [
      { name: '云逸 多语言', value:'zh-CN-YunyiMultilingualNeural', gender: 'male' },
      { name: '晓辰 多语言', value:'zh-CN-XiaochenMultilingualNeural', gender: 'female' },
      { name: '晓雨 多语言', value:'zh-CN-XiaoyuMultilingualNeural', gender: 'female' },
      { name: '晓晓 多语言', value:'zh-CN-XiaoxiaoMultilingualNeural', gender: 'female' },
      { name: '晓晓', value: 'zh-CN-XiaoxiaoNeural' , gender: 'female' },
      { name: '云希', value: 'zh-CN-YunxiNeural' , gender: 'male' },
      { name: '云健', value: 'zh-CN-YunjianNeural' , gender: 'male' },
      { name: '晓伊', value: 'zh-CN-XiaoyiNeural' , gender: 'female' },
      { name: '云扬', value: 'zh-CN-YunyangNeural' , gender: 'male' },
      { name: '晓辰', value: 'zh-CN-XiaochenNeural' , gender: 'female' },
      { name: '晓涵', value: 'zh-CN-XiaohanNeural' , gender: 'female' },
      { name: '晓梦', value: 'zh-CN-XiaomengNeural' , gender: 'female' },
      { name: '晓墨', value: 'zh-CN-XiaomoNeural' , gender: 'female' },
      { name: '晓秋', value: 'zh-CN-XiaoqiuNeural' , gender: 'female' },
      { name: '晓睿', value: 'zh-CN-XiaoruiNeural' , gender: 'female' },
      { name: '晓双', value: 'zh-CN-XiaoshuangNeural' , gender: 'female' },
      { name: '晓颜', value: 'zh-CN-XiaoyanNeural' , gender: 'female' },
      { name: '晓悠', value: 'zh-CN-XiaoyouNeural' , gender: 'female' },
      { name: '晓甄', value: 'zh-CN-XiaozhenNeural' , gender: 'female' },
      { name: '云枫', value: 'zh-CN-YunfengNeural' , gender: 'male' },
      { name: '云皓', value: 'zh-CN-YunhaoNeural' , gender: 'male' },
      { name: '云夏', value: 'zh-CN-YunxiaNeural' , gender: 'male' },
      { name: '云野', value: 'zh-CN-YunyeNeural' , gender: 'male' },
      { name: '云泽', value: 'zh-CN-YunzeNeural' , gender: 'male' },
      { name: '晓柔', value: 'zh-CN-XiaorouNeural' , gender: 'female' },
      { name: '云杰', value: 'zh-CN-YunjieNeural' , gender: 'male' },
      { name: '晓萱', value: 'zh-CN-XiaoxuanNeural' , gender: 'female' },
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

  public static SetCharacterList(characters: Character[]): void {
    localStorage.setItem('available-characters', JSON.stringify(characters));
  }

  public static GetCharacterList(): Character[] {
    let savedCharacters = localStorage.getItem('available-characters');
    if (savedCharacters !== null) {
      return JSON.parse(savedCharacters);
    }
    return [];
  }

  public static GetSpeakerIdentificationEnabled(): boolean {
    let savedEnabled = localStorage.getItem('speaker-identification-enabled');
    if (savedEnabled !== null) {
      return savedEnabled === 'true';
    }
    return false;
  }

  public static SetSpeakerIdentificationEnabled(enabled: boolean): void {
    localStorage.setItem('speaker-identification-enabled', enabled.toString());
  }
}
