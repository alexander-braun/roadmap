import { NgModule } from '@angular/core';
import { SignupComponent } from './signup.component';
import { SharedModule } from '../../shared/shared.modules';
import { SignupIconComponent } from './signup-icon/signup-icon.component';

@NgModule({
  declarations: [SignupComponent, SignupIconComponent],
  exports: [SignupComponent],
  imports: [SharedModule],
})
export class SignupModule {}
