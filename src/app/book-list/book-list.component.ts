import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { KeyDialogComponent } from '../key-dialog/key-dialog.component';
import { MatDialog } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

  constructor(
    private appService: AppService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  bookPaths: string[] = [];

  ngOnInit(): void {
    this.bookPaths = this.appService.GetBookPaths();
  }

  OnBookClicked(path: string): void {
    this.router.navigate(['/epub-view', path]);
  }

  OnEnterKeyClicked(): void {
    this.dialog.open(KeyDialogComponent);
  }

}
