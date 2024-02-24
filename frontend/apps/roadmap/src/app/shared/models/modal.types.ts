import { LoginComponent } from '../../features/login/login.component';
import { SettingsComponent } from '../../features/map/settings/settings.component';
import { PresetsComponent } from '../../features/presets/presets.component';
import { ProfileComponent } from '../../features/profile/profile.component';
import { SignupComponent } from '../../features/signup/signup.component';

export interface ModalTypes {
  settingsComponent: typeof SettingsComponent;
  loginComponent: typeof LoginComponent;
  signupComponent: typeof SignupComponent;
  presetsComponent: typeof PresetsComponent;
  profileComponent: typeof ProfileComponent;
}

export type ModalComponents =
  | SettingsComponent
  | LoginComponent
  | SignupComponent
  | PresetsComponent
  | ProfileComponent;
