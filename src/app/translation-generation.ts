import { AppService } from './app.service';

export class TranslationGeneration {
  private appService: AppService;
  private translationMap: { [key: string]: Promise<string> | string } = {};

  constructor(appService: AppService) {
    this.appService = appService;
  }

  public async GetTranslation(text: string): Promise<string> {
    if (!this.translationMap[text]) {
      await this.GenerateTranslation(text);
    }

    return this.translationMap[text];
  }

  public async GenerateTranslation(text: string): Promise<void> {
    if (this.translationMap[text]) {
      return;
    }
    this.translationMap[text] = await this.appService.GetTranslation(text);
  }
}
