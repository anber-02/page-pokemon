import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(private http:HttpClient) { }

  getPokemons(){
    return this.http.get('https://pokeapi.co/api/v2/type/poison/')
    // https://pokeapi.co/api/v2/ability/?limit=20&offset=20
  }

  getPokemon(name : any){
    return this.http.get(`https://pokeapi.co/api/v2/pokemon/${name}/`)
  }
}
