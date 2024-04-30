import { Character } from './model/character';
import { Speaker } from './model/speaker';
import { CharacterVoice, VoiceProfile } from './model/voice';
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

  public static GetVoiceForSpeaker(speaker: Speaker): CharacterVoice {
    return (
      AppSettings.GetSavedCharacterVoice(speaker.name) ??
      AppSettings.GetDefaultVoice(speaker.name, speaker.gender)
    );
  }

  public static GetVoiceForCharacter(character: Character): CharacterVoice {
    return (
      AppSettings.GetSavedCharacterVoice(character.name) ??
      AppSettings.GetDefaultVoice(character.name, character.gender)
    );
  }

  private static GetDefaultVoice(name: string, gender: string): CharacterVoice {
    let key = 'default';
    if (name === 'narration') {
      key = 'narration';
    } else if (gender === 'male') {
      key = 'male';
    } else if (gender === 'female') {
      key = 'female';
    }
    return AppSettings.GetCharacterVoice(key);
  }

  public static GetCharacterVoice(key: string): CharacterVoice {
    return (
      AppSettings.GetSavedCharacterVoice(key) ??
      AppSettings.BuildCharacterVoice(AppSettings.GetVoiceProfiles()[0])
    );
  }

  private static GetSavedCharacterVoice(
    key: string,
  ): CharacterVoice | undefined {
    let savedVoiceJson = localStorage.getItem(key);
    if (savedVoiceJson !== null) {
      try {
        return JSON.parse(savedVoiceJson) as CharacterVoice;
      } catch (error) {
        console.error('Error parsing voice profile for ' + key + ': ' + error);
      }
    }
    return undefined;
  }

  public static SetCharacterVoice(key: string, voice: CharacterVoice): void {
    const voiceJson = JSON.stringify(voice);
    localStorage.setItem(key, voiceJson);
  }

  public static BuildCharacterVoice(
    voice: VoiceProfile,
    style?: string,
    role?: string,
  ): CharacterVoice {
    // Check style in voice.StyleList
    if (style && voice.StyleList && !voice.StyleList.includes(style)) {
      style = undefined;
    }
    // Check role in voice.RolePlayList
    if (role && voice.RolePlayList && !voice.RolePlayList.includes(role)) {
      role = undefined;
    }
    return {
      name: voice.LocalName,
      value: voice.ShortName,
      gender: voice.Gender,
      style,
      role,
    };
  }

  public static GetVoiceProfiles(): VoiceProfile[] {
    return voiceJson as VoiceProfile[];
  }

  public static GetAzureCognitiveServiceKey(): string {
    let savedAzureCognitiveServiceKey = localStorage.getItem(
      'azure-cognitive-service-key',
    );
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
