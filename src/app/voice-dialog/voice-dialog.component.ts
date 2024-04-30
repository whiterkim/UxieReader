import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Character } from '../model/character';

@Component({
  selector: 'app-voice-dialog',
  templateUrl: './voice-dialog.component.html',
  styleUrl: './voice-dialog.component.css'
})
export class VoiceDialogComponent{

  characters: Character[] = [];
  isDefaultMode: boolean = false;

  constructor(public dialogRef: MatDialogRef<VoiceDialogComponent>) {
  }

  SetCharacters(characters: Character[]) {
    this.characters = characters;
  }
}
