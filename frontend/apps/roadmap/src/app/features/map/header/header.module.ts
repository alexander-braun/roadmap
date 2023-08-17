import { NgModule } from '@angular/core';
import { HeaderLeftComponent } from './header-left/header-left.component';
import { HeaderRightComponent } from './header-right/header-right.component';
import { HeaderComponent } from './header.component';
import { SharedModule } from '../../../shared/shared.modules';

@NgModule({
  declarations: [HeaderLeftComponent, HeaderRightComponent, HeaderComponent],
  imports: [SharedModule],
  exports: [HeaderComponent],
  providers: [],
})
export class HeaderModule {}
