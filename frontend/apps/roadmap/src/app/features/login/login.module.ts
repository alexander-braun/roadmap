import { NgModule } from '@angular/core';
import { LoginComponent } from './login.component';
import { LoginIconComponent } from './login-icon/login-icon.component';
import { SharedModule } from '../../shared/shared.modules';

@NgModule({
  declarations: [LoginComponent, LoginIconComponent],
  imports: [SharedModule],
  exports: [LoginComponent],
})
export class LoginModule {}
