import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { MapModule } from './map/map.module';
import { MapService } from './map/map.service';
import { ResizeObserverService } from '../shared/services/resize-observer.service';
import { SvgPathComponent } from './svg-path/svg-path.component';
import { NavigationComponent } from './navigation/navigation.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SharedModule } from '../shared/shared.modules';
import { LoginModule } from './login/login.module';
import { AuthInterceptor } from '../shared/services/auth-interceptor';
import { CookieService } from 'ngx-cookie-service';
import { SignupComponent } from './signup/signup.component';

@NgModule({
  declarations: [SignupComponent, SvgPathComponent, AppComponent, NavigationComponent],
  imports: [
    BrowserModule,
    MapModule,
    SharedModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    HttpClientModule,
    LoginModule,
  ],
  providers: [
    CookieService,
    MapService,
    ResizeObserverService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
