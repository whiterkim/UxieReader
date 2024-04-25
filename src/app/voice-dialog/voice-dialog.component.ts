import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppSettings } from '../app.settings';
import { Character } from '../model/character';
import { Speaker } from '../model/speaker';

@Component({
  selector: 'app-voice-dialog',
  templateUrl: './voice-dialog.component.html',
  styleUrl: './voice-dialog.component.css'
})
export class VoiceDialogComponent{

  narrationVoice: string;
  maleVoice: string;
  femaleVoice: string;
  characters: Character[] = [];
  isDefaultMode: boolean = false;

  constructor(public dialogRef: MatDialogRef<VoiceDialogComponent>) { 
    this.narrationVoice = AppSettings.GetDefaultVoice({
      speaker: 'narration',
      gender: 'NA',
      target: 'NA',
    } as Speaker);
    this.maleVoice = AppSettings.GetDefaultVoice({
      speaker: 'Male Default',
      gender: 'male',
      target: 'NA',
    } as Speaker);
    this.femaleVoice = AppSettings.GetDefaultVoice({
      speaker: 'Female Default',
      gender: 'female',
      target: 'NA',
    } as Speaker);
  }

  GetVoices(): string[] {
    return AppSettings.VoiceList();
  }

  OnVoiceClicked(role: string, voice: string): void {
    if (role === 'narration') {
      this.narrationVoice = voice;
      AppSettings.SetVoice('narration', voice);
    } else if (role === 'male') {
      this.maleVoice = voice;
      AppSettings.SetVoice('male', voice);
    } else if (role === 'female') {
      this.femaleVoice = voice;
      AppSettings.SetVoice('female', voice);
    }

    console.log('Voice changed for ' + role + ' to ' + voice);
    AppSettings.SetVoice(role, voice);
  }

  SetCharacters(characters: Character[]) {
    this.characters = characters;
  }

  GetVoice(character: Character): string {
    return AppSettings.GetVoice({
      speaker: character.character,
      gender: character.gender,
      target: 'NA',
    } as Speaker);
  }
}
