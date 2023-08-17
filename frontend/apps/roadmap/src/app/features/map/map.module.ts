import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MapComponent } from './map.component';
import { CardComponent } from './card/card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './settings/settings.component';
import { HeaderModule } from './header/header.module';
import { SharedModule } from '../../shared/shared.modules';
import { MapService } from './map.service';

@NgModule({
  declarations: [CardComponent, SettingsComponent, MapComponent],
  imports: [BrowserModule, ReactiveFormsModule, SharedModule, HeaderModule],
  exports: [MapComponent],
  providers: [MapService],
})
export class MapModule {}
