import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MapComponent } from './map.component';
import { CardComponent } from './card/card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.modules';
import { SettingsComponent } from './settings/settings.component';
import { HeaderModule } from './header/header.module';

@NgModule({
  declarations: [MapComponent, CardComponent, SettingsComponent],
  imports: [BrowserModule, ReactiveFormsModule, SharedModule, HeaderModule],
  exports: [MapComponent],
  providers: [],
})
export class MapModule {}
