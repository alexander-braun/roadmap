import { ComponentRef } from '@angular/core';
import { ApplicationRef, EmbeddedViewRef, Injectable, createComponent, EnvironmentInjector } from '@angular/core';
import { SettingsComponent } from '../../app/map/settings/settings.component';
import { ModalComponents, ModalTypes } from '../models/modal.types';

export const identifierToComponentMap = {
  settingsComponent: SettingsComponent,
} as const;

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  stage?: HTMLDivElement;
  dialogRef?: ComponentRef<ModalComponents>;

  constructor(private appRef: ApplicationRef, private injector: EnvironmentInjector) {}

  public open(component: ModalTypes): void {
    const dialogRef = createComponent<ModalComponents>(identifierToComponentMap[component], {
      environmentInjector: this.injector,
    });
    this.appRef.attachView(dialogRef.hostView);

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.appendChild((dialogRef.hostView as EmbeddedViewRef<any>).rootNodes[0]);

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
