import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http'
import { DetailPokemonComponent } from './detail-pokemon/detail-pokemon.component';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [DetailPokemonComponent, HomeComponent],
  exports: [HomeComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ]
})
export class PokemonModule { }
