import { Component, OnInit } from '@angular/core';
import { KeyDialogComponent } from '../key-dialog/key-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import bookListJson from '../../assets/book_list.json';
import { AppSettings } from '../app.settings';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css'],
})
export class BookListComponent implements OnInit {
  constructor(public dialog: MatDialog) {}

  bookPaths: any;

  ngOnInit(): void {
    AppSettings.SetLastBookPath(null);
    this.bookPaths = bookListJson;
  }

  OnEnterKeyClicked(): void {
    this.dialog.open(KeyDialogComponent);
  }
}
