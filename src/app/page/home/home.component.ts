import { Component, HostListener, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { DOCUMENT } from '@angular/common';
import { ModalService } from 'src/app/services/modal.service';
import { isEmpty } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('container__pokemons') containerPokemons!:ElementRef

  pokemons: any[] = [];
  showButton = false;
  pokemosOffset = 20;
  haBuscado = false

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private pokemonService: PokemonService,
    protected modalService: ModalService
  ) { }
  // datos de los Pokemon's
  pokemons$ = this.pokemonService.pokemons$;


  ngOnInit(): void {
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const yOffSet = window.scrollY;
    const scrollTop = this.document.documentElement.scrollTop
    this.showButton = (scrollTop) > 400
  }
  onScrollTop() {
    this.document.documentElement.scrollTop = 0
  }

  onScrollDown() {
    const container = this.containerPokemons.nativeElement;
      const contentHeight = container.scrollHeight;
      const containerHeight = window.innerHeight;
      // Si el contenido no es más alto que la ventana visible, desactiva el infinito scroll
      const shouldLoadMore = contentHeight > containerHeight;
      if(shouldLoadMore){
        this.pokemonService.getPokemonsByLimit(this.pokemosOffset);
        this.pokemosOffset +=20;
      }
  }

  getColorRGBA(colorName: string, opacity: number): string {
    if (colorName === null) colorName = 'default'
    const colorMap: { [key: string]: string } = {
      'default': `rgba(0, 0, 0, ${opacity})`,
      'gray': `rgba(5, 5, 5, ${opacity})`,
      'red': `rgba(255, 0, 0, ${opacity})`,
      'green': `rgba(0, 128, 0, ${opacity})`,
      'blue': `rgba(0, 0, 255, ${opacity})`,
      'yellow': `rgba(255, 255, 0, ${opacity})`,
      'purple': `rgba(128, 0, 128, ${opacity})`,
      'orange': `rgba(255, 165, 0, ${opacity})`,
      'pink': `rgba(255, 192, 203, ${opacity})`,
      'brown': `rgba(166, 43, 43, ${opacity})`,
      // 'white': `rgba(150, 50, 255, .3)`,
      // Agrega más colores según tus necesidades
    };
    // Obtén el valor rgba del mapa o usa un valor predeterminado si no se encuentra
    return colorMap[colorName.toLowerCase()] || `rgba(0, 0, 0, ${opacity})`;
  }





}
