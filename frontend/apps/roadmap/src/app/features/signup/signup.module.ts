import { NgModule } from '@angular/core';
import { SignupComponent } from './signup.component';
import { SharedModule } from '../../shared/shared.modules';

@NgModule({
  declarations: [SignupComponent],
  exports: [SignupComponent],
  imports: [SharedModule],
})
export class SignupModule {}
