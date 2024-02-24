import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.modules';
import { ProfileComponent } from './profile.component';
import { ProfileIconComponent } from './profile-icon/profile-icon.component';

@NgModule({
  declarations: [ProfileComponent, ProfileIconComponent],
  imports: [SharedModule],
  exports: [ProfileComponent],
})
export class ProfileModule {}
