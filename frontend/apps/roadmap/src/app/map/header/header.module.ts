import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.modules';
import { HeaderLeftComponent } from './header-left/header-left.component';
import { HeaderRightComponent } from './header-right/header-right.component';
import { HeaderComponent } from './header.component';
@NgModule({
  declarations: [HeaderLeftComponent, HeaderRightComponent, HeaderComponent],
  imports: [BrowserModule, ReactiveFormsModule, SharedModule],
  exports: [HeaderComponent],
  providers: [],
})
export class HeaderModule {}
