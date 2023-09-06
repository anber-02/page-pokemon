import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { mergeMap, map, forkJoin, BehaviorSubject, tap, withLatestFrom, switchMap, filter, Subject } from 'rxjs';
import { Pokemon } from '../types';
@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private pokemonsSubject = new BehaviorSubject<any[]>([]);
  pokemons$ = this.pokemonsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getPokemons(0)
  }

  private getPokemons(offset: number): void {
    this.http.get(`${environment.API_URL}pokemon?limit=20&offset=${offset}`).pipe(
      mergeMap((res: any) => {
        const results = res.results;
        // creamos un arreglo de observables
        const observables = results.map((result: any) => {
          return this.http.get(result.url);
        });
        // con forkJoin esperamos que se resuelvan los observables y une los observables en un solo arreglo
        return forkJoin(observables).pipe(
          tap((pokemonData: any) => {
            const modifiedResults = pokemonData.map((result: Pokemon) => ({
              ...result,
              image: result.sprites?.other?.home.front_default || result.sprites?.front_default,
              types: result.types
            }))
            // Aquí almacenamos los resultados de la api

            // Recuperando las especies de cada pokemon
            const species = pokemonData.map((pokemon: Pokemon) => {
              return this.http.get(pokemon.species.url)
            })

            forkJoin(species).pipe(
              tap((pokemonSpecies: any) => {
                const allDataPokemons = modifiedResults.map((pokemon: Pokemon) => {
                  const species = pokemonSpecies.filter((pokeSpecies: any) => pokeSpecies.id === pokemon.id);
                  return {
                    pokemon: pokemon,
                    species: species[0]
                  }
                })
                this.pokemonsSubject.next(allDataPokemons)
              })
            ).subscribe();


          })
        )
      })
    ).subscribe();
    // nos suscribimos al observable para que se ejecute
  }
  getPokemonsByLimit(offset: number) {
    return this.http.get(`${environment.API_URL}pokemon?limit=20&offset=${offset}`).pipe(
      mergeMap((res: any) => {
        const results = res.results;
        const observables = results.map((result: any) => {
          return this.http.get(result.url);
        });
        return forkJoin(observables).pipe(
          switchMap((pokemonData: any) => {
            const modifiedResults = pokemonData.map((result: Pokemon) => ({
              ...result,
              image: result.sprites?.other?.home.front_default || result.sprites?.front_default,
              types: result.types
            }));
  
            // Recuperando las especies de cada pokemon
            const species = pokemonData.map((pokemon: Pokemon) => {
              return this.http.get(pokemon.species.url);
            });
  
            return forkJoin(species).pipe(
              map((pokemonSpecies: any) => {
                const allDataPokemons = modifiedResults.map((pokemon: Pokemon) => {
                  const species = pokemonSpecies.find((pokeSpecies: any) => pokeSpecies.id === pokemon.id);
                  return {
                    pokemon: pokemon,
                    species: species
                  };
                });
                return allDataPokemons;
              })
            );
          })
        );
      }),
      withLatestFrom(this.pokemons$),
      tap(([allDataPokemons, pokemons]) => {
        // console.log('Pokemons con datos adicionales:', {allDataPokemons, pokemons});
        // Aquí puedes realizar cualquier acción adicional con los datos resultantes.
        this.pokemonsSubject.next([...pokemons,...allDataPokemons, ])
      })
      ).subscribe();
  }

  searchPokemos(name:string){
    return this.http.get(`${environment.API_URL}pokemon?limit=10000`).pipe(
      map((res: any) => {
        const results = res.results;
        const  pokemonList = results.filter((pokemon: any) => {
          const pokemonName = pokemon.name.toLowerCase();
          return pokemonName.includes(name.toLowerCase());
        });
        console.log(pokemonList)
        // creamos un arreglo de observables
       return pokemonList
        // con forkJoin esperamos que se resuelvan los observables y une los observables en un solo arreglo
      })
    );
  }
}
