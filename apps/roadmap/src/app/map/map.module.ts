import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MapComponent } from './map.component';
import { SvgPathComponent } from '../svg-path/svg-path.component';
import { CardComponent } from './card/card.component';

@NgModule({
  declarations: [MapComponent, SvgPathComponent, CardComponent],
  imports: [BrowserModule],
  exports: [MapComponent, SvgPathComponent],
  providers: [],
})
export class MapModule {}
