import { StyleManager } from './style-manager';

export class ParagraphManager {
  private paragraphs: string[] = [];
  paragraphElements: HTMLElement[] = [];
  private epubElement: HTMLElement | undefined;

  Init(epubElement?: HTMLElement): void {
    if (!epubElement) {
      return;
    }

    this.epubElement = epubElement;
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

  GetElement(index: number): HTMLElement {
    return this.paragraphElements[index];
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

  Add(element: HTMLElement): void {
    if (element.textContent) {
      this.paragraphElements.push(element);
    } else {
      this.paragraphElements.push(element);
    }
  }

  private HandleLinkClick(child: HTMLElement): void {
    const links = child.getElementsByTagName('a');
    if (links.length === 1) {
      const link = links[0];
      link.addEventListener('click', () => {
        // Sleep a bit then refresh style
        setTimeout(() => {
          StyleManager.RefreshStyle(this.epubElement);
        }, 100);
      });
    }
  }

  SetClickEventCallback(
    callback: (element: HTMLElement, index: number) => void,
  ): void {
    for (let i = 0; i < this.paragraphElements.length; i++) {
      const element = this.paragraphElements[i];
      callback(element, i);
    }
  }

  private ProcessDocumentElements(
    element: HTMLElement,
    counter: number = 0,
  ): void {
    for (let i = 0; i < element.children.length; i++) {
      let child = element.children[i] as HTMLElement;
      if (child.tagName === 'SECTION') {
        this.ProcessDocumentElements(child, counter);
      } else {
        this.Add(child);
      }

      this.HandleLinkClick(child);
      counter++;
    }
  }
}
