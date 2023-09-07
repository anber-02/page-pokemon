import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { mergeMap, map, forkJoin, BehaviorSubject, tap, withLatestFrom, switchMap, filter, Subject } from 'rxjs';
import { type Pokemon, type Type, Species } from '../types';
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
        const detallesPokemon = results.map((result: any) => {
          return this.http.get(result.url);
        });
        // con forkJoin esperamos que se resuelvan los observables y une los observables en un solo arreglo
        return forkJoin(detallesPokemon)
          .pipe(
            tap((pokemonData: any) => {
              //pokemData es un arreglo con todos los datos de cada pokemon
              const modifiedResults = pokemonData.map((result: Pokemon) => {
                // result es un pokemon
                const pokemon = {
                  ...result,
                  image: result.sprites?.other?.home.front_default || result.sprites?.front_default,
                  types: result.types
                }

                return pokemon
              })
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
                  allDataPokemons.forEach((poke: any) => {
                    const typesSpanish = poke.pokemon.types.map((type: Type) => {
                      return this.http.get(type.type.url);
                    });

                    forkJoin(typesSpanish).subscribe((typeDataArray: any) => {
                      const modifiedTypes = typeDataArray.map((type: any) => {
                        const typeInSpanish = type.names.find((entry: any) => entry.language.name === 'es');
                        return {
                          type: {
                            name: typeInSpanish.name
                          }
                        };
                      });
                      // podemos modificar el objeto iterando ya que javaScript maneja los objetos por referencia
                      poke.pokemon.types = modifiedTypes;
                    })

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

                allDataPokemons.map((poke: any) => {
                  const typesSpanish = poke.pokemon.types.map((type: Type) => {
                    return this.http.get(type.type.url);
                  });

                  forkJoin(typesSpanish).subscribe((typeDataArray: any) => {
                    const modifiedTypes = typeDataArray.map((type: any) => {
                      const typeInSpanish = type.names.find((entry: any) => entry.language.name === 'es');
                      return {
                        type: {
                          name: typeInSpanish.name
                        }
                      };
                    });
                    poke.pokemon.types = modifiedTypes;
                  })
                })

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
        this.pokemonsSubject.next([...pokemons, ...allDataPokemons,])
      })
    ).subscribe();
  }

  searchPokemos(name: string) {
    return this.http.get(`${environment.API_URL}pokemon?limit=10000`).pipe(
      map((res: any) => {
        const results = res.results;
        const pokemonList = results.filter((pokemon: any) => {
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

  // Obtener información del Pokémon y sus evoluciones
  // getPokemonAndEvolutions(pokemonName: string): Observable<any> {
  //   // Obtener información del Pokémon principal
  //   return this.http.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`).pipe(
  //     mergeMap((pokemonData: any) => {
  //       // Obtener información de las especies del Pokémon
  //       return this.http.get(pokemonData.species.url).pipe(
  //         mergeMap((speciesData: any) => {
  //           // Obtener información de las cadenas de evolución
  //           return this.http.get(speciesData.evolution_chain.url);
  //         }),
  //         mergeMap((evolutionChain: any) => {
  //           // Recorrer la cadena de evolución y obtener detalles de cada etapa
  //           const evolutionStages = [];
  //           let currentEvol = evolutionChain.chain;

  //           while (currentEvol) {
  //             evolutionStages.push({
  //               name: currentEvol.species.name,
  //               trigger: currentEvol.evolution_details[0]?.trigger?.name,
  //             });
  //             currentEvol = currentEvol.evolves_to[0]; // Siguiente etapa de evolución
  //           }

  //           // Obtener detalles de cada etapa de evolución
  //           const evolutionRequests = evolutionStages.map((stage) => {
  //             return this.http.get(`https://pokeapi.co/api/v2/pokemon/${stage.name}`);
  //           });

  //           // Usar forkJoin para obtener detalles de todas las etapas de evolución
  //           return forkJoin(evolutionRequests).pipe(
  //             // Mapear los resultados en un objeto con la información del Pokémon y sus evoluciones
  //             switchMap((evolutionPokemonData: any[]) => {
  //               const result = {
  //                 pokemon: pokemonData,
  //                 evolutions: evolutionStages.map((stage, index) => ({
  //                   name: stage.name,
  //                   trigger: stage.trigger,
  //                   details: evolutionPokemonData[index],
  //                 })),
  //               };
  //               return of(result);
  //             })
  //           );
  //         })
  //       );
  //     })
  //   );
  // }
  // get
}
