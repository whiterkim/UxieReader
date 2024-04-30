export interface CharacterVoice {
  name: string; // LocalName
  value: string; // ShortName
  gender: string; // Gender
  style?: string; // StyleList
  role?: string; // RolePlayList
}

export interface VoiceProfile {
  LocalName: string;
  ShortName: string;
  Gender: string;
  StyleList?: string[];
  RolePlayList?: string[];
}
