import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppService } from '../app.service';
import { AppSettings } from '../app.settings';
import { AppUtils } from '../app.utils';
import { Book } from '../model/book';

@Component({
  selector: 'app-txt-view',
  templateUrl: './txt-view.component.html',
  styleUrls: ['./txt-view.component.css'],
})
export class TxtViewComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private router: Router,
  ) {}

  audio: HTMLAudioElement = new Audio();
  jumpInput: HTMLInputElement | undefined;

  book: Book | undefined;
  paragraphDisplayed: Array<number> = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  ];
  isPlaying: boolean = false;

  settings: AppSettings | undefined;
  textSize: number = 1;
  counter: number = 0;

  async ngOnInit(): Promise<void> {
    // Get book name from params
    let params = await firstValueFrom(this.activatedRoute.params);
    let bookName = params['key'];

    AppUtils.KeepScreenOn();

    let loadedBook = await this.appService.LoadBook(bookName);
    if (loadedBook) {
      this.book = loadedBook;
    } else {
      // Go to the book list page
      this.router.navigate(['/book-list']);
    }

    this.settings = new AppSettings(bookName);
    this.counter = this.settings.GetCounter();
    this.textSize = AppSettings.GetTextSize();

    this.InitAudioElement();
    this.InitInputElement();
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

  OnPlayClicked(): void {
    this.isPlaying = true;
    if (this.book) {
      this.Play(this.book.paragraphs[this.counter]);
    }
  }

  OnPauseClicked(): void {
    this.isPlaying = false;
    this.audio.pause();
  }

  async OnPreviousClicked(): Promise<void> {
    this.counter--;
    if (this.isPlaying) {
      if (this.book) {
        this.Play(this.book.paragraphs[this.counter]);
      }
    }
    this.settings?.SetCounter(this.counter);
  }

  async OnNextClicked(): Promise<void> {
    this.counter++;
    if (this.isPlaying) {
      if (this.book) {
        this.Play(this.book.paragraphs[this.counter]);
      }
    }
    this.settings?.SetCounter(this.counter);
  }

  OnChangeBookClicked(): void {
    this.router.navigate(['/book-list']);
  }

  OnChapterClicked(chapter: number): void {
    this.counter = chapter;
    this.settings?.SetCounter(this.counter);
  }

  OnTextSizeClicked(diff: number): void {
    this.textSize += diff;
    AppSettings.SetTextSize(this.textSize);
  }

  // OnPreviousVoiceClicked(): void {
  //   AppSettings.SetPreviousVoice();
  // }

  // OnNextVoiceClicked(): void {
  //   AppSettings.SetNextVoice();
  // }

  private async Play(text: string): Promise<void> {
    let voice = await this.appService.GetVoice(text);
    const url = URL.createObjectURL(voice);
    if (!this.audio.paused) {
      this.audio.pause();
    }
    this.audio.src = url;
    this.audio.load();
    this.audio.play();
  }
}
