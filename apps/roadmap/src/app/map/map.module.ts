import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MapComponent } from './map.component';
import { CardComponent } from './card/card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../shared/services/shared.modules';

@NgModule({
  declarations: [MapComponent, CardComponent],
  imports: [BrowserModule, ReactiveFormsModule, SharedModule],
  exports: [MapComponent],
  providers: [],
})
export class MapModule {}
