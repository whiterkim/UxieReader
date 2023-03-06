import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppSettings } from '../app.settings';

@Component({
  selector: 'app-key-dialog',
  templateUrl: './key-dialog.component.html',
  styleUrls: ['./key-dialog.component.css']
})
export class KeyDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<KeyDialogComponent>) { }

  azureKey: string|undefined = undefined;

  ngOnInit(): void {
    this.azureKey = AppSettings.GetAzureKey();
  }

  OnEnterClicked(): void {
    AppSettings.SetAzureKey(this.GetKey());
    this.dialogRef.close();
  }

  private GetKey(): string {
    let key = '';
    let element = document.getElementById('key-input');
    if (element instanceof HTMLInputElement) {
      key = element.value;
    }
    return key;
  }
}
