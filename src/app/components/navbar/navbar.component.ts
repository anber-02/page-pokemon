import { Component, HostListener, OnInit } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, Observable, switchMap, of, tap } from 'rxjs';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  searchPokemon$ = new Subject<string>()
  searchResults:any = []
  searchTerm = {
    text: '',
    url: ''
  }
  showResults = false

  constructor(private pokemonService: PokemonService) {
    this.searchPokemon$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((name: string) => {
        if (name.length <= 0) {
          return of(null); // Emite un valor nulo si la longitud del nombre es <= 0
        }
        return this.pokemonService.searchPokemons(name);
      }),
    ).subscribe((data:any) => {this.searchResults = data})
  }

  ngOnInit(): void {
  }

  search(event: Event) {
    const element = event.currentTarget as HTMLInputElement
    this.searchPokemon$.next(element.value)
    this.showResults = true
  }
  changeSearchTerm(event: Event, result: any) {
    const element = event.currentTarget as HTMLElement
    this.searchTerm.text = element.textContent?.trim() || ''
    this.searchTerm.url = result.url
    this.onSubmit()
    this.showResults = false
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    if (!clickedElement.classList.contains('results')) {
      this.showResults = false
    }
  }
  onSubmit() {
    if(this.searchTerm.text && this.searchTerm.url){
      this.pokemonService.getInfoPokemon(this.searchTerm)
    }
    if(!this.searchTerm.url && (this.searchResults.length > 0)){
      this.pokemonService.getInfoPokemons(this.searchResults)
    }
    this.searchTerm = { text: '', url: '' }
    this.showResults = false
  }
}
