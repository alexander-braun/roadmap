import { NgModule } from '@angular/core';
import { MapModule } from './map/map.module';
import { SvgPathModule } from './svg-path/svg-path.module';
import { LoginModule } from './login/login.module';
import { SignupModule } from './signup/signup.module';
import { SharedModule } from '../shared/shared.modules';

@NgModule({
  declarations: [],
  exports: [SvgPathModule, MapModule, LoginModule, SignupModule],
})
export class FeaturesModule {}
