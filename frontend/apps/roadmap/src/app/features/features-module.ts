import { NgModule } from '@angular/core';
import { MapModule } from './map/map.module';
import { SvgPathModule } from './svg-path/svg-path.module';
import { LoginModule } from './login/login.module';
import { SignupModule } from './signup/signup.module';
import { PresetsModule } from './presets/presets.module';

@NgModule({
  declarations: [],
  exports: [SvgPathModule, MapModule, LoginModule, PresetsModule, SignupModule],
})
export class FeaturesModule {}
