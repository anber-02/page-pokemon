import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http'
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { ModalComponent } from '../components/modal/modal.component';
import { CardDetailComponent } from '../components/card-detail/card-detail.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { SpinnerModule } from '../components/spinner/spinner.module';



@NgModule({
  declarations: [HomeComponent, ModalComponent, CardDetailComponent],
  exports: [HomeComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    InfiniteScrollModule,
    SpinnerModule
  ]
})
export class PokemonModule { }
