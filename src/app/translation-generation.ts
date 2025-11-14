import { AppService } from './app.service';
import { AppSettings } from './app.settings';
import { ParagraphManager } from './paragraph-manager';

export class TranslationGeneration {
  private appService: AppService;
  private paragraphManager: ParagraphManager;
  private translationMap: { [key: string]: Promise<string> | string } = {};

  constructor(appService: AppService, paragraphManager: ParagraphManager) {
    this.appService = appService;
    this.paragraphManager = paragraphManager;
  }

  public async GetTranslation(text: string | null): Promise<string> {
    if (!text || text.trim().length === 0) {
      return '';
    }

    if (!this.translationMap[text]) {
      await this.GenerateTranslation(text);
    }

    return this.translationMap[text];
  }

  public async GenerateTranslation(text: string): Promise<void> {
    if (this.translationMap[text]) {
      return;
    }

    this.translationMap[text] = this.appService.GetTranslation(text);
    this.translationMap[text] = await this.translationMap[text];
  }

  public async TriggerTranslate(counter: number): Promise<void> {
    const element = this.paragraphManager.GetElement(counter);
    const translated = await this.GetTranslation(element.textContent);
    this.AddTranslation(element, translated);

    for (let i = 1; i < 5; i++) {
      const element = this.paragraphManager.GetElement(counter + i);
      // No need to await, just trigger translation generation for future paragraphs
      this.GetTranslation(element.textContent).then((translated) => {
        this.AddTranslation(element, translated);
      });
    }
  }

  private AddTranslation(element: Element, translated: string): void {
    const old = element.querySelector('.translation-text');
    if (old) element.removeChild(old);

    const translationElem = document.createElement('div');
    translationElem.textContent = translated ? translated : '';
    translationElem.className = 'translation-text';
    translationElem.style.color = '#8ec07c';
    translationElem.style.fontSize =
      String(AppSettings.GetTextSize() * 1.1) + 'rem';
    translationElem.style.marginTop = '0.3em';
    element.appendChild(translationElem);
  }
}
