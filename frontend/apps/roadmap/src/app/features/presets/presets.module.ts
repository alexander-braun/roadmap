import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.modules';
import { PresetsComponent } from './presets.component';
import { PresetsIconComponent } from './presets-icon/presets-icon.component';

@NgModule({
  declarations: [PresetsComponent, PresetsIconComponent],
  imports: [SharedModule],
  exports: [PresetsComponent],
})
export class PresetsModule {}
