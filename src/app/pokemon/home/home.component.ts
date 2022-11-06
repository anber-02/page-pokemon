import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  pokemons : any[] = [];
  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.pokemonService.getPokemons().subscribe((data:any) => {
      this.pokemons = data.pokemon
      console.log(data.pokemon, 'sajksdjkjas')
      console.log(this.pokemons[0])
    })
  }

  detallePokemon(){
    
  }


}
