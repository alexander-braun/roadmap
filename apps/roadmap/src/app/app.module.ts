import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { MapModule } from './map/map.module';
import { MapService } from './map/map.service';
import { ResizeObserverService } from '../shared/services/resize-observer.service';
import { SvgPathComponent } from './svg-path/svg-path.component';

@NgModule({
  declarations: [SvgPathComponent, AppComponent],
  imports: [BrowserModule, MapModule, RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' })],
  providers: [MapService, ResizeObserverService],
  bootstrap: [AppComponent],
})
export class AppModule {}
