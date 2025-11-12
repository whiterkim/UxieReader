import { AppSettings } from './app.settings';
import { TranslationGeneration } from './translation-generation';

export class ParagraphManager {
  private paragraphs: string[] = [];
  paragraphElements: Element[] = [];
  translationGeneration: TranslationGeneration | undefined;

  Init(epubElement?: HTMLElement): void {
    if (!epubElement) {
      return;
    }

    this.Clear();
    this.ProcessDocumentElements(epubElement);
  }

  Clear(): void {
    this.paragraphs = [];
    this.paragraphElements = [];
  }

  GetSize(): number {
    return this.paragraphElements.length;
  }

  GetParagraph(index: number): string {
    return this.paragraphElements[index].textContent || '';
  }

  GetParagraphs(): string[] {
    if (this.paragraphs.length === 0) {
      this.paragraphs = this.paragraphElements.map(
        (el) => el.textContent || '',
      );
    }
    return this.paragraphs;
  }

  GetTranslatedParagraph(index: number): string {
    return (
      this.paragraphElements[index].querySelector('.translation-text')
        ?.textContent || ''
    );
  }

  Add(element: Element): void {
    if (element.textContent) {
      this.paragraphElements.push(element);
    } else {
      this.paragraphElements.push(element);
    }
  }

  TriggerTranslate(): void {
    for (let element of this.paragraphElements) {
      this.AddTranslation(element);
    }
  }

  private async AddTranslation(child: Element): Promise<void> {
    const old = child.querySelector('.translation-text');
    if (old) child.removeChild(old);

    const text = child.textContent;
    if (!text || text.trim().length === 0) {
      return;
    }

    const translated = await this.translationGeneration?.GetTranslation(text);

    const translationElem = document.createElement('div');
    translationElem.textContent = translated ? translated : '';
    translationElem.className = 'translation-text';
    translationElem.style.color = '#8ec07c';
    translationElem.style.fontSize =
      String(AppSettings.GetTextSize() * 1.1) + 'rem';
    translationElem.style.marginTop = '0.3em';
    child.appendChild(translationElem);
  }

  private HandleLinkClick(child: Element): void {
    const links = child.getElementsByTagName('a');
    if (links.length === 1) {
      const link = links[0];
      link.addEventListener('click', () => {
        // Sleep a bit then refresh style
        setTimeout(() => {
          // TODO: Move to StyleManager
          // this.RefreshStyle();
        }, 100);
      });
    }
  }

  SetClickEventCallback(
    callback: (element: Element, index: number) => void,
  ): void {
    for (let i = 0; i < this.paragraphElements.length; i++) {
      const element = this.paragraphElements[i];
      callback(element, i);
    }
  }

  private ProcessDocumentElements(element: Element, counter: number = 0): void {
    for (let i = 0; i < element.children.length; i++) {
      let child = element.children[i];
      if (child.tagName === 'SECTION') {
        this.ProcessDocumentElements(child, counter);
      } else {
        this.Add(child);
      }

      this.HandleLinkClick(child);
      counter++;
    }
  }

  MarkParagraph(index: number) {
    const child = this.paragraphElements[index] as HTMLElement;
    if (child) {
      child.setAttribute('style', 'background-color:#2C2C2C;');
      if (!this.isElementInViewport(child)) {
        child.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  UnmarkParagraph(index: number) {
    const child = this.paragraphElements[index] as HTMLElement;
    if (child) {
      child.setAttribute('style', '');
    }
  }

  private isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}
