import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {LoginComponent} from './components/login/login.component';
import {ResponseInterceptor} from './interceptor/interceptor.service';
import {HomeComponent} from './components/home/home.component';
import {YandexService} from './services/yandex/yandex.service';
import {YandexUserRepository} from './infrastructure/repositories/yandex/yandex.user.repository';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {GoogleService} from './services/google/google.service';
import {GoogleUserRepository} from './infrastructure/repositories/google/google.user.repository';
import {AlertService} from './services/alert/alert.service';
import {AlertComponent} from './components/alert/alert.component';
import {NotifierService} from './services/notifier/notifier.service';
import {LoaderService} from './services/loader/loader.service';
import {LoaderComponent} from './components/loader/loader.component';
import {ReactiveFormsModule} from '@angular/forms';
import {AuthService} from './services/auth/auth.service';
import {AuthGuard} from './infrastructure/guard/auth.guard';
import {HeaderComponent} from './components/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    AlertComponent,
    LoaderComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule
  ],
  providers: [
    HttpClientModule,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResponseInterceptor,
      multi: true
    },
    YandexService,
    YandexUserRepository,
    GoogleService,
    GoogleUserRepository,
    AlertService,
    NotifierService,
    LoaderService,
    AuthService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
