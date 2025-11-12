import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppSettings } from '../app.settings';

@Component({
    selector: 'app-book-list-item',
    templateUrl: './book-list-item.component.html',
    styleUrl: './book-list-item.component.css',
    standalone: false
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

  GetCollapse(item: any): boolean {
    return AppSettings.GetCollapse(item.key);
  }

  OnCollapseClicked(item: any) {
    item.collapse = !item.collapse;
    AppSettings.SetCollapse(item.key, item.collapse);
  }

  OnBookClicked(path: string): void {
    AppSettings.SetLastBookPath(path);
    this.router.navigate(['/epub-view', path]);
  }
}
