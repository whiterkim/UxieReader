import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { BookListComponent } from './book-list/book-list.component';
import { EpubViewComponent } from './epub-view/epub-view.component';
import { TxtViewComponent } from './txt-view/txt-view.component';
import { KeyDialogComponent } from './key-dialog/key-dialog.component';
import { VoiceDialogComponent } from './voice-dialog/voice-dialog.component';
import { BookListItemComponent } from "./book-list-item/book-list-item.component";

@NgModule({
    declarations: [
        AppComponent,
        MainComponent,
        BookListComponent,
        BookListItemComponent,
        EpubViewComponent,
        TxtViewComponent,
        KeyDialogComponent,
        VoiceDialogComponent,
    ],
    providers: [],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        NgbModule,
        MatDialogModule,
        BrowserAnimationsModule,
    ]
})
export class AppModule { }
