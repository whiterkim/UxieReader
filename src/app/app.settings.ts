export class AppSettings {
  constructor(bookName: string) {
    this.bookName = bookName;
  }

  bookName: string = '';

  public GetCounter(): number {
    let savedCounter = localStorage.getItem(this.bookName + 'counter');
    if (savedCounter !== null) {
      return +savedCounter;
    }
    // Start from beginning when no saved counter found.
    return 0;
  }

  public SetCounter(counter: number): void {
    localStorage.setItem(this.bookName + 'counter', counter.toString());
  }

  // Static methods
  public static GetTextSize(): number {
    let savedSize = localStorage.getItem('textSize');
    if (savedSize !== null) {
        return +savedSize;
    }
    // Set the default size to 1rem.
    return 1;
  }

  public static SetTextSize(size: number): void {
    localStorage.setItem('textSize', size.toString());
  }
}
