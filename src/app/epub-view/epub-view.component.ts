import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Book, NavItem, Rendition } from 'epubjs';
import Section from 'epubjs/types/section';
import Spine from 'epubjs/types/spine';
import { firstValueFrom } from 'rxjs';
import { AppService } from '../app.service';
import { AppSettings } from '../app.settings';
import { AppUtils } from '../app.utils';
import { KeyDialogComponent } from '../key-dialog/key-dialog.component';
import { SpeakerIdentification } from '../speaker-identification';
import { AudioGeneration } from '../audio-generation';
import { VoiceDialogComponent } from '../voice-dialog/voice-dialog.component';
import { Character } from '../model/character';

@Component({
  selector: 'app-epub-view',
  templateUrl: './epub-view.component.html',
  styleUrls: ['./epub-view.component.css'],
})
export class EpubViewComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private router: Router,
    public dialog: MatDialog,
  ) {}

  @Input()
  bookName?: string;

  audio: HTMLAudioElement = new Audio();
  jumpInput: HTMLInputElement | undefined;

  rendition: Rendition | undefined;
  chapters: any[] = [];
  paragraphs: string[] = [];
  isPlaying: boolean = false;

  settings: AppSettings | undefined;
  textSize: number = 1;
  counter: number = 0;

  audioGeneration: AudioGeneration | undefined;
  speakerIdentification: SpeakerIdentification | undefined;
  availableCharacters: Character[] = [];
  availableCharactersLoading = false;

  async ngOnInit(): Promise<void> {
    // Get book name from params
    let params = await firstValueFrom(this.activatedRoute.params);

    let bookName = params['key'];
    if (this.bookName) {
      bookName = this.bookName;
    }

    AppUtils.KeepScreenOn();

    let loadedBook = this.appService.GetEpub(bookName);
    if (!loadedBook) {
      this.router.navigate(['/book-list']);
    }

    this.rendition = loadedBook.renderTo('epub-viewer-area', {
      width: '100%',
      height: '100%',
      flow: 'scrolled',
    });

    this.textSize = AppSettings.GetTextSize();
    this.settings = new AppSettings(bookName);
    const savedCfi = this.settings.GetEpubCfi();
    if (savedCfi) {
      await this.Navigate(savedCfi);
    } else {
      await this.rendition?.display();
      this.GetParagraphs();
      this.RefreshStyle();
    }

    this.InitAudioElement();
    this.InitInputElement();

    this.GetChapters(loadedBook);
    this.RefreshCurrentChapter(savedCfi);

    this.TriggerInitialization();
  }

  private GetCfiBase(cfi: string): string | undefined {
    // Regular expression to match the CFI base
    const regex = /epubcfi\((\/\d+\/\d+)!/;
    // Execute the regex on the input string
    const match = regex.exec(cfi);
    // Return the matched group or null if no match is found
    return match ? match[1] : undefined;
  }

  private GetChapters(book: Book): void {
    const spine = book.spine;
    const toc = book.navigation.toc;
    this.chapters = [];
    spine.each((item: Section, _: number) => {
      // Try match toc item and spine item
      let tocItem = toc.find(
        (tocItem: NavItem) => '/' + tocItem.href === item.url,
      );
      if (!tocItem) {
        tocItem = toc.find((tocItem: NavItem) => tocItem.href === item.href);
      }
      const name = tocItem?.label ?? item.href.split('/')[1].split('.')[0];
      const cfi = 'epubcfi(' + item.cfiBase + '!/0/0/0/0)';
      this.chapters.push({
        name: name,
        cfi: cfi,
      });
    });
  }

  private RefreshCurrentChapter(currentCfi?: string): void {
    if (!currentCfi) {
      currentCfi = (this.rendition?.currentLocation() as any).end.cfi;
    }

    if (currentCfi) {
      const currentCfiBase = this.GetCfiBase(currentCfi);
      this.chapters.forEach((chapter) => {
        chapter.isCurrent = currentCfiBase === this.GetCfiBase(chapter.cfi);
      });
    }
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
        this.UnmarkParagraph(this.counter);
        this.counter = this.jumpInput ? +this.jumpInput?.value : 0;
        this.MarkParagraph(this.counter);
      });
    }
  }

  private GetEpubElement(): HTMLElement | undefined {
    let epubViewerElement = document.getElementById('epub-viewer-area');
    let iframeElements = epubViewerElement?.getElementsByTagName('iframe');
    let iframeElement = iframeElements?.item(0);
    const bodyElement = iframeElement?.contentDocument?.body;
    return bodyElement;
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

  private async Navigate(cfi: string): Promise<void> {
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
      child?.setAttribute('style', 'background-color:#52595D;');
      child?.scrollIntoView(true);
    }
  }

  private UnmarkParagraph(index: number) {
    let element = this.GetEpubElement();
    if (element) {
      let child = element.children[index];
      child?.setAttribute('style', '');
    }
  }

  private async ChangeSection(
    isNext: boolean,
    isBeginning: boolean,
  ): Promise<void> {
    if (isNext) {
      await this.rendition?.next();
    } else {
      await this.rendition?.prev();
    }

    this.RefreshCurrentChapter();
    this.GetParagraphs();
    this.counter = isBeginning ? 0 : this.paragraphs.length - 1;
    this.TriggerInitialization();
    this.RefreshStyle();
    this.MarkParagraph(this.counter);
    this.SaveSettings();
    if (this.isPlaying) {
      this.Play(this.counter);
    }
  }

  OnChangeBookClicked(): void {
    this.router.navigate(['/book-list']);
  }

  OnPlayClicked(): void {
    this.isPlaying = true;
    this.Play(this.counter);
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
      this.Play(this.counter);
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
      this.Play(this.counter);
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

  async OnEnableSpeakerIdentificationToggled(): Promise<void> {
    this.speakerIdentification?.ToggleEnabled();
  }

  async OnGetCharacterListClicked(): Promise<void> {
    const voiceDialog = this.dialog.open(VoiceDialogComponent);
    voiceDialog.componentInstance.isDefaultMode = false;
    voiceDialog.componentInstance.SetCharacters(this.availableCharacters);
  }

  async OnRefreshCharacterListClicked(): Promise<void> {
    if (this.availableCharactersLoading) {
      return;
    }

    this.availableCharactersLoading = true;
    try {
      this.availableCharacters = await this.appService.ListCharacters(
        this.paragraphs,
      );
      AppSettings.SetCharacterList(this.availableCharacters);
    } catch (error) {
      console.log('Refresh character list error ', error);
      this.availableCharactersLoading = false;
    }
    this.availableCharactersLoading = false;
  }

  async OnRefreshSpeakerIdentificationClicked(): Promise<void> {
    // This will clear the lock and trigger a request immediately.
    await this.speakerIdentification?.Init(this.counter);
  }

  OnChangeVoicesClicked(): void {
    const voiceDialog = this.dialog.open(VoiceDialogComponent);
    voiceDialog.componentInstance.isDefaultMode = true;
    voiceDialog.componentInstance.SetCharacters(this.availableCharacters);
  }

  OnChapterClicked(chapter: any): void {
    this.Navigate(chapter.cfi);
    this.RefreshCurrentChapter(chapter.cfi);
    this.SaveSettings(chapter.cfi);
  }

  private SaveSettings(currentCfi?: string): void {
    if (!currentCfi) {
      currentCfi = (this.rendition?.currentLocation() as any).end.cfi;
    }

    if (currentCfi) {
      this.settings?.SetEpubCfi(currentCfi);
      this.settings?.SetEpubCounter(this.counter);
    }
  }

  private async Play(counter: number): Promise<void> {
    const text = this.paragraphs[counter];
    const voice =
      (await this.audioGeneration?.GetAudio(counter)) ??
      (await this.appService.GetVoice(text, SpeakerIdentification.Default()));
    if (voice.size === undefined) {
      // If voice.size is undefined, it is likely the Azure service call failed.
      this.dialog.open(KeyDialogComponent);
      this.isPlaying = false;
      return;
    }
    const url = URL.createObjectURL(voice);
    if (!this.audio.paused) {
      this.audio.pause();
    }
    this.audio.src = url;
    this.audio.load();
    this.audio.play();
  }

  private async TriggerInitialization(): Promise<void> {
    // Get from local storage unless click on refresh
    this.availableCharacters = AppSettings.GetCharacterList();

    this.speakerIdentification = new SpeakerIdentification(
      this.appService,
      this.availableCharacters,
      this.paragraphs,
    );

    this.audioGeneration = new AudioGeneration(
      this.appService,
      this.paragraphs,
      this.speakerIdentification,
    );

    // Refresh speaker identification on initialization
    try {
      await this.OnRefreshSpeakerIdentificationClicked();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'SpeakerIdentification is disabled'
      ) {
        // Safe to ignore
        return;
      }
      console.log('TriggerInitialization error ', error);
    }
  }
}
