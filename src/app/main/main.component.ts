import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppSettings } from '../app.settings';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  lastBookPath: string | null = null;

  ngOnInit(): void {
    this.lastBookPath = AppSettings.GetLastBookPath();
  }

}
