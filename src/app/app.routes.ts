import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from './page/home/home.component';

const routes:Routes =[
    {path:'home', component: HomeComponent},
    {path: '**', component: HomeComponent}
]


export const routing = RouterModule.forRoot(routes)