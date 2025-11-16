import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Book, NavItem, Rendition } from 'epubjs';
import Section from 'epubjs/types/section';
import { firstValueFrom } from 'rxjs';
import { AppService } from '../app.service';
import { AppSettings } from '../app.settings';
import { AppUtils } from '../app.utils';
import { KeyDialogComponent } from '../key-dialog/key-dialog.component';
import { SpeakerIdentification } from '../speaker-identification';
import { AudioGeneration } from '../audio-generation';
import { VoiceDialogComponent } from '../voice-dialog/voice-dialog.component';
import { Character } from '../model/character';
import { TranslationGeneration } from '../translation-generation';
import { ParagraphManager } from '../paragraph-manager';
import { StyleManager } from '../style-manager';

@Component({
  selector: 'app-epub-view',
  templateUrl: './epub-view.component.html',
  styleUrls: ['./epub-view.component.css'],
  standalone: false,
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
  playSpeed: number = 1.0;
  jumpInput: HTMLInputElement | undefined;

  rendition: Rendition | undefined;
  chapters: any[] = [];
  isPlaying: boolean = false;

  paragraphManager: ParagraphManager = new ParagraphManager();

  settings: AppSettings | undefined;
  counter: number = 0;

  audioGeneration: AudioGeneration | undefined;
  translationGeneration: TranslationGeneration | undefined;
  speakerIdentification: SpeakerIdentification | undefined;
  availableCharacters: Character[] = [];
  availableCharactersLoading = false;

  showTranslation: boolean = false;
  readTranslatedContent: boolean = false;

  async ngOnInit(): Promise<void> {
    // Get book name from params
    let params = await firstValueFrom(this.activatedRoute.params);

    let bookName = params['key'];
    if (bookName && !bookName.endsWith('.epub')) {
      bookName += '.epub';
    }
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
      allowScriptedContent: true,
    });

    this.settings = new AppSettings(bookName);
    const savedCfi = this.settings.GetEpubCfi();
    if (savedCfi) {
      await this.Navigate(savedCfi);
    } else {
      await this.rendition?.display();
      this.GetParagraphs();
      StyleManager.RefreshStyle(this.GetEpubElement());
    }

    this.InitAudioElement();
    this.InitInputElement();
    this.InitVisibleEvent();

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
        tocItem = toc.find(
          (tocItem: NavItem) =>
            tocItem.href === item.href ||
            tocItem.href.split('#')[0] === item.href,
        );
      }
      const name = tocItem?.label ? tocItem.label : item.idref;
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
      this.audio.addEventListener('ended', (_) => {
        this.OnNextParagraphClicked();
      });
      this.audio.addEventListener('error', (_) => {
        this.OnNextParagraphClicked();
      });
      this.audio.playbackRate = this.playSpeed;
    }
  }

  private InitInputElement(): void {
    let element = document.getElementById('jump-input');
    if (element instanceof HTMLInputElement) {
      this.jumpInput = element;
      this.jumpInput?.addEventListener('input', (_) => {
        StyleManager.UnmarkParagraph(
          this.paragraphManager.GetElement(this.counter),
        );
        this.counter = this.jumpInput ? +this.jumpInput?.value : 0;
        StyleManager.MarkParagraph(
          this.paragraphManager.GetElement(this.counter),
        );
      });
    }
  }

  private InitVisibleEvent() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Scroll the current paragraph in view
        StyleManager.MarkParagraph(
          this.paragraphManager.GetElement(this.counter),
        );
      }
    });
  }

  private GetEpubElement(): HTMLElement | undefined {
    const epubViewerArea = document.getElementById('epub-viewer-area');
    const iframe = epubViewerArea?.getElementsByTagName('iframe')?.item(0);
    const bodyElement = iframe?.contentDocument?.body;

    let element = bodyElement;
    while (
      element?.children[0]?.tagName === 'DIV' ||
      element?.children[0]?.tagName === 'SECTION'
    ) {
      element = element?.children[0] as HTMLElement;
    }
    return element;
  }

  private AddClickEventToParagraphs(child: Element, counter: number): void {
    child.addEventListener('click', () => {
      StyleManager.UnmarkParagraph(
        this.paragraphManager.GetElement(this.counter),
      );
      this.counter = counter;
      if (this.jumpInput) {
        this.jumpInput.value = this.counter.toString();
      }
      StyleManager.MarkParagraph(
        this.paragraphManager.GetElement(this.counter),
      );
      this.SaveSettings();
      if (this.showTranslation) {
        this.translationGeneration?.TriggerTranslate(this.counter);
      }
    });
  }

  private GetParagraphs(): void {
    const element = this.GetEpubElement();
    this.paragraphManager.Init(element);
    this.paragraphManager.SetClickEventCallback(
      this.AddClickEventToParagraphs.bind(this),
    );
  }

  OnToggleTranslation(): void {
    this.showTranslation = !this.showTranslation;
    if (this.showTranslation) {
      this.translationGeneration?.TriggerTranslate(this.counter);
      this.readTranslatedContent = true;
    } else {
      this.readTranslatedContent = false;
    }
  }

  OnToggleReadTranslatedContent(): void {
    if (this.showTranslation) {
      this.readTranslatedContent = !this.readTranslatedContent;
    }
  }

  private async Navigate(cfi: string): Promise<void> {
    // Make sure element is there
    await this.rendition?.display(cfi);
    this.GetParagraphs();
    let savedCounter = this.settings?.GetEpubCounter();
    this.counter = savedCounter ?? 0;
    StyleManager.RefreshStyle(this.GetEpubElement());
    // Navigate to CFI again after the style adjustment
    await this.rendition?.display(cfi);
    StyleManager.MarkParagraph(this.paragraphManager.GetElement(this.counter));
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
    this.counter = isBeginning ? 0 : this.paragraphManager.GetSize() - 1;
    this.TriggerInitialization();
    StyleManager.RefreshStyle(this.GetEpubElement());
    StyleManager.MarkParagraph(this.paragraphManager.GetElement(this.counter));
    this.SaveSettings();
    this.Play(this.counter);
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
    StyleManager.UnmarkParagraph(
      this.paragraphManager.GetElement(this.counter),
    );
    this.counter--;
    if (this.counter < 0) {
      this.ChangeSection(false, false);
      return;
    }
    StyleManager.MarkParagraph(this.paragraphManager.GetElement(this.counter));
    this.SaveSettings();
    if (this.showTranslation) {
      this.translationGeneration?.TriggerTranslate(this.counter).then(() => {
        this.Play(this.counter);
      });
    } else {
      this.Play(this.counter);
    }
  }

  OnNextParagraphClicked() {
    StyleManager.UnmarkParagraph(
      this.paragraphManager.GetElement(this.counter),
    );
    this.counter++;
    if (this.counter >= this.paragraphManager.GetSize()) {
      this.OnNextSectionClicked();
      return;
    }
    StyleManager.MarkParagraph(this.paragraphManager.GetElement(this.counter));
    this.SaveSettings();
    if (this.showTranslation) {
      this.translationGeneration?.TriggerTranslate(this.counter).then(() => {
        this.Play(this.counter);
      });
    } else {
      this.Play(this.counter);
    }
  }

  async OnPreviousSectionClicked(): Promise<void> {
    await this.ChangeSection(false, true);
  }

  async OnNextSectionClicked(): Promise<void> {
    await this.ChangeSection(true, true);
  }

  GetTextSize(): number {
    return AppSettings.GetTextSize();
  }

  OnTextSizeClicked(diff: number): void {
    const textSize = AppSettings.GetTextSize() + diff;
    AppSettings.SetTextSize(textSize);
    StyleManager.RefreshStyle(this.GetEpubElement());
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
        this.paragraphManager.GetParagraphs(),
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
    if (!this.isPlaying) {
      return;
    }

    const shouldReadTranslated =
      this.showTranslation && this.readTranslatedContent;

    const text = shouldReadTranslated
      ? this.paragraphManager.GetTranslatedParagraph(counter)
      : this.paragraphManager.GetParagraph(counter);

    const voice = shouldReadTranslated
      ? // If reading translated content, always get new voice
        await this.appService.GetVoice(text, SpeakerIdentification.Default())
      : // Otherwise, use speaker identification
        (await this.audioGeneration?.GetAudio(counter)) ??
        (await this.appService.GetVoice(text, SpeakerIdentification.Default()));
    if (voice.size === undefined) {
      // If voice.size is undefined, it is likely the Azure service call failed.
      this.dialog.open(KeyDialogComponent);
      this.isPlaying = false;
      return;
    } else if (voice.size === 0) {
      // If voice.size is 0, it is likely the Azure service call succeeded but no audio was generated.
      // In this case, we will skip to the next paragraph.
      this.OnNextParagraphClicked();
      return;
    }
    const url = URL.createObjectURL(voice);
    if (!this.audio.paused) {
      this.audio.pause();
    }
    this.audio.src = url;
    this.audio.load();
    this.audio.playbackRate = this.playSpeed;
    this.audio.play();
  }

  OnPlaySpeedChanged(newSpeed: number): void {
    this.playSpeed = newSpeed;
    this.audio.playbackRate = this.playSpeed;
  }

  private async TriggerInitialization(): Promise<void> {
    // Get from local storage unless click on refresh
    this.availableCharacters = AppSettings.GetCharacterList();

    this.speakerIdentification = new SpeakerIdentification(
      this.appService,
      this.availableCharacters,
      this.paragraphManager.GetParagraphs(),
    );

    this.audioGeneration = new AudioGeneration(
      this.appService,
      this.paragraphManager.GetParagraphs(),
      this.speakerIdentification,
    );

    this.translationGeneration = new TranslationGeneration(
      this.appService,
      this.paragraphManager,
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

  OnRefreshStyleClicked(): void {
    StyleManager.RefreshStyle(this.GetEpubElement());
  }
}
