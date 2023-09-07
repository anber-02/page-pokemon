import { Component, OnInit } from '@angular/core';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-spinner',
  template: `
  <div class="overlay" *ngIf="isLoading | async">
    <div class="lds-dual-ring" ></div>
    <span>Cargando pokemones...</span>
  </div>
  `,
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {
  isLoading  = this.spinnerService.isLoading$
  constructor(private spinnerService : SpinnerService) { }

  ngOnInit(): void {
  }

}
