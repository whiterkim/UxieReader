import { Component, OnInit } from '@angular/core';
import Epub, { Rendition } from 'epubjs';
import { AppService } from '../app.service';

@Component({
  selector: 'app-epub-view',
  templateUrl: './epub-view.component.html',
  styleUrls: ['./epub-view.component.css']
})
export class EpubViewComponent implements OnInit {

  constructor(
    private appService: AppService,
  ) { }

  rendition: Rendition | undefined;

  async ngOnInit(): Promise<void> {
    let element = document.querySelector('html');

    var book = Epub("assets/NT11.epub");
    this.rendition = book.renderTo("area", {
      width: "100%",
      height: "100%",
      manager: "continuous",
      flow: "scrolled",
    });
    var displayed = this.rendition.display();
    await displayed;
    this.rendition?.next();
  }

  OnPrevClicked(): void {
    this.rendition?.prev();
  }

  OnNextClicked(): void {
    console.log(this.rendition);
    this.rendition?.next();
  }

}
