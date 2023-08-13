import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { MapModule } from './map/map.module';
import { MapService } from './map/map.service';
import { ResizeObserverService } from '../shared/services/resize-observer.service';
import { SvgPathComponent } from './svg-path/svg-path.component';
import { ModalDirective } from '../shared/directives/modal.directive';
import { NavigationComponent } from './navigation/navigation.component';
import { ViewContainerRef } from '@angular/core';
import { OverlayComponent } from './overlay.component';

@NgModule({
  declarations: [SvgPathComponent, AppComponent, ModalDirective, NavigationComponent, OverlayComponent],
  imports: [BrowserModule, MapModule, RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' })],
  providers: [MapService, ResizeObserverService],
  bootstrap: [AppComponent],
  exports: [ModalDirective],
})
export class AppModule {}
