import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Rendition } from 'epubjs';
import Section from 'epubjs/types/section';
import Spine from 'epubjs/types/spine';
import { firstValueFrom } from 'rxjs';
import { AppService } from '../app.service';
import { AppSettings } from '../app.settings';
import { AppUtils } from '../app.utils';

@Component({
  selector: 'app-epub-view',
  templateUrl: './epub-view.component.html',
  styleUrls: ['./epub-view.component.css']
})
export class EpubViewComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private router: Router,
  ) { }

  audio: HTMLAudioElement = new Audio();
  jumpInput: HTMLInputElement | undefined;

  rendition: Rendition | undefined;
  chapters: any[] = [];
  paragraphs: string[] = [];
  isPlaying: boolean = false;

  settings: AppSettings | undefined;
  textSize: number = 1;
  counter: number = 0;

  async ngOnInit(): Promise<void> {
    // Get book name from params
    let params = await firstValueFrom(this.activatedRoute.params);
    let bookName = params['key'];

    AppUtils.KeepScreenOn();

    let loadedBook = this.appService.GetEpub(bookName);
    if (!loadedBook) {
      this.router.navigate(['/book-list']);
    }

    this.rendition = loadedBook.renderTo("epub-viewer-area", {
      width: "100%",
      height: "100%",
      flow: "scrolled",
    });

    this.textSize = AppSettings.GetTextSize();
    this.settings = new AppSettings(bookName);
    let savedCfi = this.settings.GetEpubCfi();
    if (savedCfi) {
      await this.Navigate(savedCfi);
    } else {
      await this.rendition?.display();
      this.RefreshStyle();
    }

    this.InitAudioElement();
    this.InitInputElement();

    this.GetChapters(loadedBook.spine);
  }

  private GetChapters(spine: Spine): void {
    this.chapters = [];
    spine.each((item: Section, _: number) => {
      let name = item.href.split('/')[1].split('.')[0];
      let cfi = 'epubcfi(' + item.cfiBase + '!/0/0/0/0)'
      this.chapters.push({
        name: name,
        cfi: cfi,
      });
    })
  }

  private InitAudioElement(): void {
    let element = document.getElementById('text-audio');
    if (element instanceof HTMLAudioElement) {
      this.audio = element;
      this.audio.addEventListener('ended', (event) => {
        this.OnNextParagraphClicked();
      });
      this.audio.addEventListener('error', (event) => {
        this.OnNextParagraphClicked();
      });
    }
  }

  private InitInputElement(): void {
    let element = document.getElementById('jump-input');
    if (element instanceof HTMLInputElement) {
      this.jumpInput = element;
      this.jumpInput?.addEventListener('input', (event) => {
        console.log(this.jumpInput?.value);
        this.UnmarkParagraph(this.counter);
        this.counter = this.jumpInput ? +this.jumpInput?.value : 0;
        this.MarkParagraph(this.counter);
      });
    }
  }

  private GetEpubElement(): HTMLDivElement | undefined {
    let epubViewerElement = document.getElementById('epub-viewer-area');
    let iframeElements = epubViewerElement?.getElementsByTagName('iframe');
    let iframeElement = iframeElements?.item(0);
    let divElements = iframeElement?.contentDocument?.getElementsByTagName('div');
    let divElement = divElements?.item(0);
    return divElement ? divElement : undefined;
  }

  private GetParagraphs(): void {
    this.paragraphs = [];
    let element = this.GetEpubElement();
    if (element) {
      for (let i = 0; i < element.children.length; i++) {
        let child = element.children[i];
        if (child.textContent) {
          this.paragraphs.push(child.textContent);
        } else {
          this.paragraphs.push('');
        }
      }
    }
  }

  private RefreshStyle(): void {
    let style = '';
    // Make dark background
    style += 'background-color:#212529;';
    // Make white text
    style += 'color:white;';
    // Adjust text size
    style += 'font-size:' + this.textSize + 'rem;';

    this.GetEpubElement()?.setAttribute('style', style);
  }

  private async Navigate(cfi: string) : Promise<void> {
    // Make sure element is there
    await this.rendition?.display(cfi);
    this.GetParagraphs();
    let savedCounter = this.settings?.GetEpubCounter();
    if (savedCounter === undefined || savedCounter === null) {
      this.counter = 0;
    } else {
      this.counter = savedCounter;
    }
    this.RefreshStyle();
    // Navigate to CFI again after the style adjustment
    await this.rendition?.display(cfi);
    this.MarkParagraph(this.counter);
  }

  private MarkParagraph(index: number) {
    let element = this.GetEpubElement();
    if (element) {
        let child = element.children[index];
        child?.setAttribute("style", "background-color:darkgoldenrod;");
        child?.scrollIntoView(true);
    }
  }

  private UnmarkParagraph(index: number) {
    let element = this.GetEpubElement();
    if (element) {
        let child = element.children[index];
        child?.setAttribute("style", "");
    }
  }

  private async ChangeSection(isNext: boolean, isBeginning: boolean): Promise<void> {
    if (isNext) {
      await this.rendition?.next();
    } else {
      await this.rendition?.prev();
    }
    this.GetParagraphs();
    this.counter = isBeginning ? 0 : this.paragraphs.length - 1;
    this.RefreshStyle();
    this.MarkParagraph(this.counter);
    this.SaveSettings();
    if (this.isPlaying) {
      this.Play(this.paragraphs[this.counter]);
    }
  }

  OnChangeBookClicked(): void {
    this.router.navigate(['/book-list']);
  }

  OnPlayClicked(): void {
    this.isPlaying = true;
    this.Play(this.paragraphs[this.counter]);
  }

  OnPauseClicked(): void {
    this.isPlaying = false;
    this.audio.pause();
  }

  OnPreviousParagraphClicked() {
    this.UnmarkParagraph(this.counter);
    this.counter--;
    if (this.counter < 0) {
      this.ChangeSection(false, false);
      return;
    }
    this.MarkParagraph(this.counter);
    this.SaveSettings();
    if (this.isPlaying) {
      this.Play(this.paragraphs[this.counter]);
    }
  }

  OnNextParagraphClicked() {
    this.UnmarkParagraph(this.counter);
    this.counter++;
    if (this.counter >= this.paragraphs.length) {
      this.OnNextSectionClicked();
      return;
    }
    this.MarkParagraph(this.counter);
    this.SaveSettings();
    if (this.isPlaying) {
      this.Play(this.paragraphs[this.counter]);
    }
  }

  async OnPreviousSectionClicked(): Promise<void> {
    await this.ChangeSection(false, true);
  }

  async OnNextSectionClicked(): Promise<void> {
    await this.ChangeSection(true, true);
  }

  OnTextSizeClicked(diff: number): void {
    this.textSize += diff;
    this.RefreshStyle();
    AppSettings.SetTextSize(this.textSize);
  }

  OnPreviousVoiceClicked(): void {
    AppSettings.SetPreviousVoice();
  }

  OnNextVoiceClicked(): void {
    AppSettings.SetNextVoice();
  }

  OnChapterClicked(chapter: any): void {
    this.Navigate(chapter.cfi);
  }

  private SaveSettings(): void {
    if (this.rendition) {
      let cfi = this.rendition.location.end.cfi;
      console.log(cfi);
      this.settings?.SetEpubCfi(cfi);
      this.settings?.SetEpubCounter(this.counter);
    }
  }

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
