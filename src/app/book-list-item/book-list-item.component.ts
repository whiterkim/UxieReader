import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppSettings } from '../app.settings';

@Component({
  selector: 'app-book-list-item',
  templateUrl: './book-list-item.component.html',
  styleUrl: './book-list-item.component.css',
})
export class BookListItemComponent {
  constructor(
    private router: Router,
    public dialog: MatDialog,
  ) {}

  @Input()
  object: any;
  @Input()
  folder: string | undefined;

  GetChildren(item: any): string[] {
    const allKeys = Object.keys(item);
    const childKeys = allKeys.filter(
      (key) => key !== 'collapse' && key !== 'files',
    );
    return childKeys;
  }

  OnCollapseClicked(item: any) {
    item.collapse = !item.collapse;
  }

  OnBookClicked(path: string): void {
    const fullPath = this.folder + '/' + path;
    AppSettings.SetLastBookPath(fullPath);
    this.router.navigate(['/epub-view', fullPath]);
  }
}
