import { NgModule } from '@angular/core';
import { SvgPathComponent } from './svg-path.component';
import { SharedModule } from '../../shared/shared.modules';

@NgModule({
  declarations: [SvgPathComponent],
  imports: [SharedModule],
  exports: [SvgPathComponent],
})
export class SvgPathModule {}
