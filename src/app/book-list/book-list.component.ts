import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

  constructor(
    private appService: AppService,
    private router: Router,
  ) { }

  bookPaths: string[] = [];

  ngOnInit(): void {
    this.bookPaths = this.appService.GetBookPaths();
  }

  OnBookClicked(path: string): void {
    this.router.navigate(['/reader-view', path]);
  }

}
