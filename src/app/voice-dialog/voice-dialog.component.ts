import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppSettings } from '../app.settings';

@Component({
  selector: 'app-voice-dialog',
  templateUrl: './voice-dialog.component.html',
  styleUrl: './voice-dialog.component.css'
})
export class VoiceDialogComponent{

  narrationVoice: string;
  maleVoice: string;
  femaleVoice: string;

  constructor(public dialogRef: MatDialogRef<VoiceDialogComponent>) { 
    this.narrationVoice = AppSettings.GetVoice('narration');
    this.maleVoice = AppSettings.GetVoice('male');
    this.femaleVoice = AppSettings.GetVoice('female');
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
    } else {
      this.femaleVoice = voice;
      AppSettings.SetVoice('female', voice);
    }
  }
}
