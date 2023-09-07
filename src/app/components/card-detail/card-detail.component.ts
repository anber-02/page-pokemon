import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.css']
})
export class CardDetailComponent implements OnInit {

  @Input() pokemon: any;
  description:string = '' 
  constructor() {
  }
  
  ngOnInit(): void {
    let data = this.pokemon.species.flavor_text_entries.find((entry: any) => entry.language.name === 'es');
    this.description = data.flavor_text
  }

}
