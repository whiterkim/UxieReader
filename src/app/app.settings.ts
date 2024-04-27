import { Character } from "./model/character";
import { Speaker } from "./model/speaker";
import { Voice } from "./model/voice";
import voiceJson from '../assets/voice-list.json';

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
    const voices = (voiceJson as any[]).map((item) => ({
      name: item.LocalName,
      value: item.ShortName,
      gender: item.Gender,
      styles: item.StyleList,
      roles: item.RolePlayList,
    } as Voice));
    return voices;
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

  public static GetLastBookPath(): string | null {
    let savedBook = localStorage.getItem('last-book-path');
    return savedBook;
  }

  public static SetLastBookPath(bookPath: string | null): void {
    if (bookPath === null) {
      localStorage.removeItem('last-book-path');
      return;
    }
    localStorage.setItem('last-book-path', bookPath);
  }
}
