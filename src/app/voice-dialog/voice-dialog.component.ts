import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppSettings } from '../app.settings';
import { Character } from '../model/character';
import { Speaker } from '../model/speaker';
import { Voice } from '../model/voice';

@Component({
  selector: 'app-voice-dialog',
  templateUrl: './voice-dialog.component.html',
  styleUrl: './voice-dialog.component.css'
})
export class VoiceDialogComponent{

  defaultVoice: Voice;
  narrationVoice: Voice;
  maleVoice: Voice;
  femaleVoice: Voice;
  characters: Character[] = [];
  isDefaultMode: boolean = false;

  constructor(public dialogRef: MatDialogRef<VoiceDialogComponent>) {
    this.defaultVoice = AppSettings.GetDefaultVoiceForRole('default');
    this.narrationVoice = AppSettings.GetDefaultVoiceForRole('narration');
    this.maleVoice = AppSettings.GetDefaultVoiceForRole('male');
    this.femaleVoice = AppSettings.GetDefaultVoiceForRole('female');
  }

  GetVoices(): Voice[] {
    return AppSettings.VoiceList();
  }

  OnVoiceClicked(role: string, voice: Voice): void {
    if (role === 'default') {
      this.defaultVoice = voice;
      AppSettings.SetVoice('default', voice);
    } else if (role === 'narration') {
      this.narrationVoice = voice;
      AppSettings.SetVoice('narration', voice);
    } else if (role === 'male') {
      this.maleVoice = voice;
      AppSettings.SetVoice('male', voice);
    } else if (role === 'female') {
      this.femaleVoice = voice;
      AppSettings.SetVoice('female', voice);
    }

    console.log('Voice changed for ' + role + ' to ' + voice.name);
    AppSettings.SetVoice(role, voice);
  }

  SetCharacters(characters: Character[]) {
    this.characters = characters;
  }

  GetVoice(character: Character): Voice {
    return AppSettings.GetVoice({
      speaker: character.character,
      gender: character.gender,
      target: 'NA',
    } as Speaker);
  }
}
