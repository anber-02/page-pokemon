import { Component, OnInit, Input } from '@angular/core';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.css']
})
export class CardDetailComponent implements OnInit {

  @Input() pokemon: any;
  description: string = ''
  evolutions: any
  constructor(private pokemonservice: PokemonService) {
  }

  ngOnInit(): void {
    let data = this.pokemon.species?.flavor_text_entries.find((entry: any) => entry.language.name === 'es');
    this.description = data?.flavor_text
    this.pokemonservice.getEvolutionPokemons(this.pokemon.species.evolution_chain.url).subscribe(res => {
      console.log(res)
      this.evolutions = res.evolutions
    })
  }


}
