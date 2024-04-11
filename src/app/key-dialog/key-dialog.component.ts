import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { AppSettings } from '../app.settings';

@Component({
  selector: 'app-key-dialog',
  templateUrl: './key-dialog.component.html',
  styleUrls: ['./key-dialog.component.css']
})
export class KeyDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<KeyDialogComponent>) { }

  azureKey: string|undefined = undefined;
  azureOpenAIKey: string|undefined = undefined;

  ngOnInit(): void {
    this.azureKey = AppSettings.GetAzureCognitiveServiceKey();
    this.azureOpenAIKey = AppSettings.GetAzureOpenAIKey();
  }

  OnEnterClicked(): void {
    AppSettings.SetCognitiveServiceAzureKey(this.GetKey('cognitive-service-key-input'));
    AppSettings.SetAzureOpenAIKey(this.GetKey('openai-key-input'));
    this.dialogRef.close();
  }

  private GetKey(elementId: string): string {
    let key = '';
    let element = document.getElementById(elementId);
    if (element instanceof HTMLInputElement) {
      key = element.value;
    }
    return key;
  }
}
