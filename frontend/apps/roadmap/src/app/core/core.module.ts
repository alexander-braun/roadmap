import { NgModule } from '@angular/core';
import { NavigationComponent } from './navigation/navigation.component';
import { SharedModule } from '../shared/shared.modules';

@NgModule({
  imports: [SharedModule],
  declarations: [NavigationComponent],
  exports: [NavigationComponent],
})
export class CoreModule {}
