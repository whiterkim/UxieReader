import { AppService } from './app.service';
import { ParagraphManager } from './paragraph-manager';
import { StyleManager } from './style-manager';

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
    StyleManager.AddTranslation(element, translated);

    for (let i = 1; i < 5; i++) {
      const element = this.paragraphManager.GetElement(counter + i);
      // No need to await, just trigger translation generation for future paragraphs
      this.GetTranslation(element.textContent).then((translated) => {
        StyleManager.AddTranslation(element, translated);
      });
    }
  }
}
