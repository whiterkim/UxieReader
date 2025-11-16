import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AppSettings } from '../app.settings';
import { AppService } from '../app.service';

@Component({
  selector: 'app-book-list-item',
  templateUrl: './book-list-item.component.html',
  styleUrl: './book-list-item.component.css',
  standalone: false,
})
export class BookListItemComponent implements OnInit {
  coverUrl: { [key: string]: string | undefined } = {};
  bookItems: any[] = [];
  groupItems: any[] = [];
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private appService: AppService,
  ) {}

  @Input()
  object: any;
  @Input()
  folder: string | undefined;

  ngOnInit() {
    this.bookItems = [];
    this.groupItems = [];
    for (let child of this.object as any[]) {
      if (child?.book_name) {
        this.bookItems.push(child);
        this.appService.GetEpubCoverUrl(child.file_name).then((url) => {
          this.coverUrl[child.file_name] = url;
        });
      } else {
        this.groupItems.push(child);
      }
    }
  }

  GetCollapse(item: any): boolean {
    return AppSettings.GetCollapse(item.key);
  }

  OnCollapseClicked(item: any) {
    item.collapse = !item.collapse;
    AppSettings.SetCollapse(item.key, item.collapse);
  }

  OnBookClicked(child: any): void {
    const path = child.file_name;
    if (path) {
      AppSettings.SetLastBookPath(path);
      this.router.navigate(['/epub-view', path]);
    } else {
      this.OnCollapseClicked(child);
    }
  }
}
