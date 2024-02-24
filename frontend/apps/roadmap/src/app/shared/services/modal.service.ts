import { ComponentRef } from '@angular/core';
import { ApplicationRef, EmbeddedViewRef, Injectable, createComponent, EnvironmentInjector } from '@angular/core';
import { ModalComponents, ModalTypes } from '../models/modal.types';
import { LoginComponent } from '../../features/login/login.component';
import { SettingsComponent } from '../../features/map/settings/settings.component';
import { SignupComponent } from '../../features/signup/signup.component';
import { PresetsComponent } from '../../features/presets/presets.component';
import { ProfileComponent } from '../../features/profile/profile.component';

export const identifierToComponentMap: ModalTypes = {
  settingsComponent: SettingsComponent,
  loginComponent: LoginComponent,
  signupComponent: SignupComponent,
  presetsComponent: PresetsComponent,
  profileComponent: ProfileComponent,
} as const;

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  stage?: HTMLDivElement;
  dialogRef?: ComponentRef<ModalComponents>;

  constructor(private appRef: ApplicationRef, private injector: EnvironmentInjector) {}

  public open(component: keyof ModalTypes): void {
    this.dialogRef = createComponent<ModalComponents>(identifierToComponentMap[component], {
      environmentInjector: this.injector,
    });
    this.appRef.attachView(this.dialogRef.hostView);

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.appendChild((this.dialogRef.hostView as EmbeddedViewRef<ApplicationRef>).rootNodes[0]);

    this.stage = document.createElement('div');
    this.stage.classList.add('stage');
    this.stage.appendChild(modal);
    this.stage.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement)?.className;
      if (target === 'stage' || target === 'modal') {
        this.close();
      }
    });
    document.body.appendChild(this.stage);
  }

  public close(): void {
    if (this.dialogRef) {
      this.appRef.detachView(this.dialogRef?.hostView);
      this.dialogRef.destroy();
    }
    this.stage?.parentNode?.removeChild(this.stage);
  }
}
