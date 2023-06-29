import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MapComponent } from './map.component';
import { CardComponent } from './card/card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.modules';

@NgModule({
  declarations: [MapComponent, CardComponent],
  imports: [BrowserModule, ReactiveFormsModule, SharedModule],
  exports: [MapComponent],
  providers: [],
})
export class MapModule {}
