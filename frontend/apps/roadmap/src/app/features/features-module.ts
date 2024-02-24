import { NgModule } from '@angular/core';
import { MapModule } from './map/map.module';
import { SvgPathModule } from './svg-path/svg-path.module';
import { LoginModule } from './login/login.module';
import { SignupModule } from './signup/signup.module';
import { PresetsModule } from './presets/presets.module';
import { ProfileModule } from './profile/profile.module';

@NgModule({
  declarations: [],
  exports: [SvgPathModule, ProfileModule, MapModule, LoginModule, PresetsModule, SignupModule],
})
export class FeaturesModule {}
