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
  audio: HTMLAudioElement = new Audio();
  paragraphDisplayed: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  jumpInput: HTMLInputElement | undefined;
  chapters: number[] = [];

  async ngOnInit(): Promise<void> {
    this.GetLocalStorage();
    try {
      const anyNav: any = navigator;
      if ('wakeLock' in navigator) {
        const wakeLock = await anyNav['wakeLock'].request('screen');
      }
    } catch (err) {
      // the wake lock request fails - usually system related, such being low on battery
      console.log(err);
    }

    this.book = await this.apiService.GetBook();
    this.GetChapters();

    this.InitAudioElement();
    this.InitInputElement();
  }

  private GetLocalStorage(): void {
    let savedCounter = localStorage.getItem('counter');
    if (savedCounter !== null) {
      this.counter = +savedCounter;
    }
  }

  private GetChapters(): void {
    let index = 0;
    for (let paragraph of this.book) {
      if (paragraph[0] == '后' && paragraph[1] == '记') {
        this.chapters.push(index);
        break;
      }
      if (paragraph[0] == '第' && (paragraph[2] == '章' || paragraph[3] == '章')) {
        this.chapters.push(index);
      }
      index++;
    }
  }

  private InitAudioElement(): void {
    let element = document.getElementById('text-audio');
    if (element instanceof HTMLAudioElement) {
      this.audio = element;
      this.audio.addEventListener('ended', (event) => {
        this.OnNextClicked();
      });
      this.audio.addEventListener('error', (event) => {
        this.OnNextClicked();
      });
    }
  }

  private InitInputElement(): void {
    let element = document.getElementById('jump-input');
    if (element instanceof HTMLInputElement) {
      this.jumpInput = element;
      this.jumpInput?.addEventListener('input', (event) => {
        console.log(this.jumpInput?.value);
        this.counter = this.jumpInput ? +this.jumpInput?.value : 0;
      });
    }
  }

  async OnPlayClicked(): Promise<void> {
    this.Play(this.book[this.counter]);
  }

  async OnPreviousClicked(): Promise<void> {
    this.counter--;
    if (!this.audio.paused) {
      this.Play(this.book[this.counter]);
    }
    localStorage.setItem('counter', this.counter.toString());
  }

  async OnNextClicked(): Promise<void> {
    this.counter++;
    if (!this.audio.paused) {
      this.Play(this.book[this.counter]);
    }
    localStorage.setItem('counter', this.counter.toString());
  }

  OnPauseClicked(): void {
    this.audio.pause();
  }

  OnChapterClicked(chapter: number): void {
    this.counter = chapter;
    localStorage.setItem('counter', this.counter.toString());
  }

  private async Play(text: string): Promise<void> {
    console.log(text);
    let blob = await this.apiService.TtsService(text);
    const url = URL.createObjectURL(blob);
    if (!this.audio.paused) {
      this.audio.pause();
    }
    this.audio.src = url;
    this.audio.load();
    this.audio.play();
  }

}
