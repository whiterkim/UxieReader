import { AppSettings } from './app.settings';

export class StyleManager {
  static InitFont() {
    const epubViewerArea = document.getElementById('epub-viewer-area');
    const iframe = epubViewerArea?.getElementsByTagName('iframe')?.item(0);
    const headElement = iframe?.contentDocument?.head;
    // insert link to head
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Noto+Serif+SC&display=swap';
    headElement?.appendChild(link);
  }

  static RefreshStyle(epubElement?: HTMLElement): void {
    let style = '';
    // Make dark background
    style += 'background-color:#121212;';
    // Make white text
    style += 'color:#E4E4E4;';
    // Adjust text size
    style += 'font-size:' + AppSettings.GetTextSize() + 'rem;';
    // Set font
    style += 'font-family: "Noto Serif SC", serif;';
    this.InitFont();
    // const epubElement = this.GetEpubElement();
    epubElement?.setAttribute('style', style);
    if (epubElement) {
      // Set style for paragraphs
      const paragraphs = epubElement.querySelectorAll('p, .bodytext, span');
      paragraphs.forEach((el) => {
        (el as HTMLElement).style.fontSize = AppSettings.GetTextSize() + 'rem';
        (el as HTMLElement).style.color = '#E4E4E4';
      });
      // Set style for links (contents/jump links)
      const links = epubElement.querySelectorAll('a');
      links.forEach((link) => {
        (link as HTMLElement).style.color = '#E4E4E4';
      });
    }
  }

  private static isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  static MarkParagraph(element?: HTMLElement): void {
    if (!element) {
      return;
    }

    element.setAttribute('style', 'background-color:#2C2C2C;color:#E4E4E4;');
    if (!this.isElementInViewport(element)) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  static UnmarkParagraph(element?: HTMLElement): void {
    if (!element) {
      return;
    }

    element.setAttribute('style', 'color:#E4E4E4;');
  }

  static AddTranslation(element: Element, translated: string): void {
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
