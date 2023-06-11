import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MapComponent } from './map.component';
import { SvgPathComponent } from '../svg-path/svg-path.component';
import { CardComponent } from './card/card.component';

@NgModule({
  declarations: [MapComponent, CardComponent],
  imports: [BrowserModule],
  exports: [MapComponent],
  providers: [],
})
export class MapModule {}
