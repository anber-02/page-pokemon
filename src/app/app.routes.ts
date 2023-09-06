import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from './app.component';
import { HomeComponent } from './pokemon/home/home.component';

const routes:Routes =[
    {path:'home', component: HomeComponent},
    {path: '**', component: HomeComponent}
]


export const routing = RouterModule.forRoot(routes)