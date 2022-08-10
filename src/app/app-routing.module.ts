import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';
import { EpubViewComponent } from './epub-view/epub-view.component';
import { MainComponent } from './main/main.component';
import { TxtViewComponent } from './txt-view/txt-view.component';

const routes: Routes = [
  {path: '', component: BookListComponent},
  {path: 'book-list', component: BookListComponent},
  {path: 'reader-view/:key', component: MainComponent},
  {path: 'epub-view/:key', component: EpubViewComponent},
  {path: 'txt-view/:key', component: TxtViewComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
