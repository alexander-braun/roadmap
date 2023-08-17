import { LoginComponent } from '../../features/login/login.component';
import { SettingsComponent } from '../../features/map/settings/settings.component';
import { SignupComponent } from '../../features/signup/signup.component';

export interface ModalTypes {
  settingsComponent: typeof SettingsComponent;
  loginComponent: typeof LoginComponent;
  signupComponent: typeof SignupComponent;
}

export type ModalComponents = SettingsComponent | LoginComponent | SignupComponent;
