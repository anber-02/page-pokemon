import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { mergeMap, map, forkJoin, BehaviorSubject, tap, withLatestFrom, switchMap, of, Observable } from 'rxjs';
import { PokemonDetail, Pokemon, ApiResponse, Type } from '../interfaces/pokemonDetail';
import { Name, TypePokemons } from '../interfaces/typesPokemon';
import { PokemonSpecies } from '../interfaces/pokemonSpecies';
@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  // Operadores
  /**
   * Si deseas procesar todas las emisiones de múltiples observables y combinarlas en un solo flujo, puedes usar mergeMap.
   * Si deseas cambiar a una nueva observación y descartar observaciones anteriores cuando se emite un nuevo valor, switchMap es la opción adecuada.
   * cuando se utiliza map, estás transformando los datos de entrada, pero aún mantienes un flujo de observables separado.
   * switchMap nos permite:Obtener el resultado de this.getDetailsPokemons(pokemons) y usarlo para construir y emitir un nuevo conjunto de observables (speciesObservables).
   * --Cancelar cualquier observación anterior en caso de que se emita un nuevo valor antes de que se complete la observación actual. Esto es útil cuando se desea evitar la acumulación de observaciones innecesarias.
   */
  private pokemonsSubject = new BehaviorSubject<any[]>([]);
  pokemons$ = this.pokemonsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getPokemons(0)
  }

  getPokemonsByLimit(offset: number) {
    return this.http.get<ApiResponse>(`${environment.API_URL}pokemon?limit=20&offset=${offset}`).pipe(
      switchMap((res) => this.getData(res.results)),
      withLatestFrom(this.pokemons$),
      tap(([morePokemons, pokemons]) => {
        this.pokemonsSubject.next([...pokemons, ...morePokemons,])
      })
    ).subscribe();
  }
  searchPokemons(name: string) {
    return this.http.get<ApiResponse>(`${environment.API_URL}pokemon?limit=10000`).pipe(
      map((res) => {
        const results: Pokemon[] = res.results;
        const pokemonList = results.filter((pokemon) => {
          const pokemonName = pokemon.name.toLowerCase();
          return pokemonName.includes(name.toLowerCase());
        });
        return pokemonList
      })
    );
  }
  getInfoPokemons(pokemons: Pokemon[]) {
    this.getData(pokemons).subscribe(res => this.pokemonsSubject.next(res))
  }
  getInfoPokemon(pokemon: any) {
    this.getDetailPokemon(pokemon.url).pipe(
      tap((pokemon) => {
        this.getSpeciesPokemon(pokemon.species.url).pipe(
          tap((species) => {
            const data = [{
              pokemon,
              species
            }]
            this.pokemonsSubject.next(data)
          })
        ).subscribe()
      })
    ).subscribe()
  }
  // recibe una url para obtener las evoluciones
  getDetailPokemon(url: string) {
    return this.http.get<PokemonDetail>(url).pipe(
      switchMap((apiResponse: PokemonDetail) => {
        const pokemon = apiResponse;
        pokemon.image = pokemon.sprites.other?.home.front_default || pokemon.sprites.front_default

        const typesSpanishObservables = pokemon.types.map((type: Type) => {
          return this.http.get<TypePokemons>(type.type.url).pipe(
            map((typeData) => {
              const typeInSpanish = typeData.names.find((entry: Name) => entry.language.name === 'es') as Name;
              return {
                type: {
                  name: typeInSpanish.name
                }
              };
            })
          );
        });

        return forkJoin(typesSpanishObservables).pipe(
          map((typesInSpanish: any) => {
            pokemon.types = typesInSpanish;
            return pokemon;
          })
        );
      })
    );
  }
  getDetailsPokemons(pokemons: Pokemon[]) {
    const data = pokemons.map(pokemon => {
      return this.getDetailPokemon(pokemon.url)
    })
    return data
  }
  getSpeciesPokemon(url: string) {
    return this.http.get<PokemonSpecies>(url)
  }
  private getData(pokemons: Pokemon[]): Observable<any> {
    // Combinar los observables dentro de getDetailPokemons usando forkJoin
    return forkJoin(this.getDetailsPokemons(pokemons)).pipe(
      switchMap((pokemonData: PokemonDetail[]) => {
        const speciesObservables = pokemonData.map((pokemon) =>
          this.getSpeciesPokemon(pokemon.species.url)
        );
        // Combinar los observables de species usando forkJoin
        return forkJoin(speciesObservables).pipe(
          map((species: PokemonSpecies[]) => {
            const combinedData = pokemonData.map((pokemon: PokemonDetail) => {
              const data = species.find(
                (pokeSpecies) => pokeSpecies.id === pokemon.id
              );
              return {
                pokemon: pokemon,
                species: data,
              };
            });
            return combinedData;
          })
        );
      })
    );
  }

  private getPokemons(offset: number): void {
    this.http.get<ApiResponse>(`${environment.API_URL}pokemon?limit=20&offset=${offset}`).pipe(
      tap((apiResponse) => {
        this.getData(apiResponse.results).subscribe(res => this.pokemonsSubject.next(res))
      })
    ).subscribe();
  }

  // getEvolutionPokemons(url: any) {
  //   return this.http.get(url).pipe(
  //     mergeMap((evolutionChain: any) => {
  //       // Recorrer la cadena de evolución y obtener detalles de cada etapa
  //       const evolutionStages: any = [];
  //       let currentEvol = evolutionChain.chain;

  //       while (currentEvol) {
  //         evolutionStages.push({
  //           name: currentEvol.species.name,
  //           trigger: currentEvol.evolution_details[0]?.trigger?.name,
  //         });
  //         currentEvol = currentEvol.evolves_to[0]; // Siguiente etapa de evolución
  //       }

  //       // Obtener detalles de cada etapa de evolución
  //       const evolutionRequests = evolutionStages.map((stage: any) => {
  //         return this.http.get(`https://pokeapi.co/api/v2/pokemon/${stage.name}`);
  //       });

  //       // Usar forkJoin para obtener detalles de todas las etapas de evolución
  //       return forkJoin(evolutionRequests).pipe(
  //         // Mapear los resultados en un objeto con la información del Pokémon y sus evoluciones
  //         switchMap((evolutionPokemonData: any) => {
  //           const result = {
  //             // pokemon:pokemonData => es la variable que contiene los detalles de cada pokemon
  //             evolutions: evolutionStages.map((stage: any, index: any) => ({
  //               name: stage.name,
  //               trigger: stage.trigger,
  //               details: evolutionPokemonData[index],
  //             })),
  //           };
  //           return of(result);
  //         })
  //       );
  //     })
  //   )
  // }

}
