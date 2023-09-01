import { LoginComponent } from '../../features/login/login.component';
import { SettingsComponent } from '../../features/map/settings/settings.component';
import { PresetsComponent } from '../../features/presets/presets.component';
import { SignupComponent } from '../../features/signup/signup.component';

export interface ModalTypes {
  settingsComponent: typeof SettingsComponent;
  loginComponent: typeof LoginComponent;
  signupComponent: typeof SignupComponent;
  presetsComponent: typeof PresetsComponent;
}

export type ModalComponents = SettingsComponent | LoginComponent | SignupComponent | PresetsComponent;
