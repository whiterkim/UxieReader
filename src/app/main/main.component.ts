import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(
    private apiService: ApiService
  ) { }

  book: string[] = [];
  counter: number = 0;
  audio: HTMLMediaElement = new Audio();
  firstClickFlag: boolean = true;

  async ngOnInit(): Promise<void> {
    this.book = await this.apiService.GetBook();
    this.counter = 0;
    this.audio.addEventListener('ended', (event) => {
      this.OnNextClicked();
    });
  }

  async OnPlayClicked(): Promise<void> {
    if (this.firstClickFlag) {
      this.firstClickFlag = false;
      this.OnNextClicked();
    } else {
      this.audio.play();
    }
  }

  async OnNextClicked(): Promise<void> {
    let blob = await this.apiService.TtsService(this.book[this.counter]);
    this.Play(blob);
    this.counter++;
  }

  OnPauseClicked(): void {
    this.audio.pause();
  }

  private Play(data: Blob): void {
    const url = URL.createObjectURL(data);
    this.audio.pause();
    this.audio.src = url;
    this.audio.load();
    this.audio.play().catch(function (error: { message: any; }) {
        console.log(error.message);
    });
  }

}
