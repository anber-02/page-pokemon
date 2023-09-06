import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, Observable, switchMap, of } from 'rxjs';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-navbar',
  template: `
  <header class="header">
    <h1 class="title">page pokemon</h1>

    <form style="position: relative;">
      <div class="search__input">
        <input (input)="search($event)" [value]="searchTerm" placeholder="Buscar por nombre o id" />
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="currentColor" d="M5 10a5 5 0 1 1 10 0a5 5 0 0 1-10 0Zm5-7a7 7 0 1 0 4.192 12.606l5.1 5.101a1 1 0 0 0 1.415-1.414l-5.1-5.1A7 7 0 0 0 10 3Z"/></g></svg>
      </div>
      <div #results *ngIf="showResults" class="results">
        <p *ngFor="let result of searchResults$ | async" (click)="changeSearchTerm($event)">
          {{result.name}}
        </p>
      </div>
    </form>
  </header>
  `,
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  searchPokemon$ = new Subject<string>()
  searchResults$!: Observable<any>
  searchTerm:string = ''
  showResults = false

  constructor(private pokemonService: PokemonService) {
    this.searchResults$ = this.searchPokemon$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((name: string) => {
        if (name.length <= 0) {
          return of(null); // Emite un valor nulo si la longitud del nombre es <= 0
        }
        return this.pokemonService.searchPokemos(name);
      }),
    )
  }

  ngOnInit(): void {
  }

  search(event: Event) {
    const element = event.currentTarget as HTMLInputElement
    this.searchPokemon$.next(element.value)
    this.showResults = true
  }
  changeSearchTerm(event:Event){
    const element = event.currentTarget as HTMLElement
    this.searchTerm = element.textContent?.trim() || ''
    this.showResults = false
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    if(!clickedElement.classList.contains('results')){
      this.showResults = false
    }
  }
}
