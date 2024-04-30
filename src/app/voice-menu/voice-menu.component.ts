import { Component, Input, OnInit } from '@angular/core';
import { AppSettings } from '../app.settings';
import { CharacterVoice, VoiceProfile } from '../model/voice';
import { Character } from '../model/character';

@Component({
  selector: 'app-voice-menu',
  templateUrl: './voice-menu.component.html',
  styleUrl: './voice-menu.component.css',
})
export class VoiceMenuComponent implements OnInit {
  @Input()
  key?: string;

  @Input()
  character?: Character;

  selectedProfile?: VoiceProfile;
  characterVoice?: CharacterVoice;

  constructor() {}

  ngOnInit(): void {
    if (this.character) {
      this.characterVoice = AppSettings.GetVoiceForCharacter(this.character);
    }

    if (this.key) {
      this.characterVoice = AppSettings.GetCharacterVoice(this.key);
    }

    if (this.characterVoice) {
      this.selectedProfile = this.GetVoiceProfiles().find(
        (profile) => profile.ShortName === this.characterVoice?.value,
      );
    }
  }

  GetVoiceProfiles(): VoiceProfile[] {
    return AppSettings.GetVoiceProfiles();
  }

  OnProfileClicked(profile: VoiceProfile) {
    this.selectedProfile = profile;
    this.characterVoice = AppSettings.BuildCharacterVoice(profile);
    this.SaveCharacterVoice();
  }

  OnStyleClicked(style?: string) {
    if (this.characterVoice) {
      this.characterVoice.style = style;
      this.SaveCharacterVoice();
    }
  }

  OnRoleClicked(role?: string) {
    if (this.characterVoice) {
      this.characterVoice.role = role;
      this.SaveCharacterVoice();
    }
  }

  SaveCharacterVoice() {
    if (!this.character && !this.key) {
      throw new Error('Character or key is not set.');
    }
    if (!this.characterVoice) {
      throw new Error('Character voice is not set.');
    }

    if (this.key) {
      AppSettings.SetCharacterVoice(this.key, this.characterVoice);
    }
    if (this.character) {
      AppSettings.SetCharacterVoice(this.character.name, this.characterVoice);
    }
  }
}
