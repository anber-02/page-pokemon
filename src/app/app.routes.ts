import { RouterModule, Routes } from "@angular/router";
import { DetailPokemonComponent } from './pokemon/detail-pokemon/detail-pokemon.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './pokemon/home/home.component';

const routes:Routes =[
    {path:'home', component: HomeComponent},
    {path:'pokemon/:id', component:DetailPokemonComponent},
    {path: '**', component: HomeComponent}
]


export const routing = RouterModule.forRoot(routes)