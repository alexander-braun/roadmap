import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MapComponent } from './map.component';
import { CardComponent } from './card/card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.modules';
import { SettingsComponent } from './settings/settings.component';
import { CategoriesDisplayComponent } from './settings/categories-icons/categories-display.component';

@NgModule({
  declarations: [MapComponent, CardComponent, SettingsComponent, CategoriesDisplayComponent],
  imports: [BrowserModule, ReactiveFormsModule, SharedModule],
  exports: [MapComponent],
  providers: [],
})
export class MapModule {}
