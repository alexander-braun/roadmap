import { LoginComponent } from '../../app/login/login.component';
import { SettingsComponent } from '../../app/map/settings/settings.component';
import { SignupComponent } from '../../app/signup/signup.component';

export interface ModalTypes {
  settingsComponent: typeof SettingsComponent;
  loginComponent: typeof LoginComponent;
  signupComponent: typeof SignupComponent;
}

export type ModalComponents = SettingsComponent | LoginComponent | SignupComponent;
