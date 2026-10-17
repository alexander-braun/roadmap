import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MapComponent } from './map.component';
import { CardComponent } from './card/card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './settings/settings.component';
import { HeaderModule } from './header/header.module';
import { SharedModule } from '../../shared/shared.modules';
import { RoadmapNavigatorComponent } from './roadmap-navigator/roadmap-navigator.component';

@NgModule({
  declarations: [CardComponent, SettingsComponent, MapComponent, RoadmapNavigatorComponent],
  imports: [BrowserModule, ReactiveFormsModule, SharedModule, HeaderModule],
  exports: [MapComponent],
})
export class MapModule {}
