import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from '../../services/pokemon.service';

@Component({
  selector: 'app-detail-pokemon',
  templateUrl: './detail-pokemon.component.html',
  styleUrls: ['./detail-pokemon.component.css']
})
export class DetailPokemonComponent implements OnInit {
  pokemon: any = {}

  constructor(private activatedRoute:ActivatedRoute, private pokemonService:PokemonService) { 
    this.activatedRoute.params.subscribe((param: any) => {
      this.pokemonService.getPokemon(param.id).subscribe((data: any) => {
        this.pokemon = data
        console.log(data)
      })
    })
  }

  ngOnInit(): void {
  }

}
