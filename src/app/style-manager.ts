import { AppSettings } from './app.settings';

export class StyleManager {
  textSize: number = AppSettings.GetTextSize();

  InitFont() {
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

  RefreshStyle(epubElement?: HTMLElement): void {
    let style = '';
    // Make dark background
    style += 'background-color:#121212;';
    // Make white text
    style += 'color:#E4E4E4;';
    // Adjust text size
    style += 'font-size:' + this.textSize + 'rem;';
    // Set font
    style += 'font-family: "Noto Serif SC", serif;';
    this.InitFont();
    // const epubElement = this.GetEpubElement();
    epubElement?.setAttribute('style', style);
    if (epubElement) {
      // Set style for paragraphs
      const paragraphs = epubElement.querySelectorAll('p, .bodytext, span');
      paragraphs.forEach((el) => {
        (el as HTMLElement).style.fontSize = this.textSize + 'rem';
        (el as HTMLElement).style.color = '#E4E4E4';
      });
      // Set style for links (contents/jump links)
      const links = epubElement.querySelectorAll('a');
      links.forEach((link) => {
        (link as HTMLElement).style.color = '#E4E4E4';
      });
    }
  }
}
