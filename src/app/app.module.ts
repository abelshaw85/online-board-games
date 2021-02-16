import { BrowserModule } from '@angular/platform-browser';
import { Injector, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { HttpInterceptorService } from './auth/http-interceptor.service';
import { HeaderComponent } from './home/header/header.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { setAppInjector } from './app-injector';
import { NewsComponent } from './home/news/news.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { SharedModule } from './shared/shared.module';
import { FooterComponent } from './home/footer/footer.component';
import { LogoComponent } from './home/footer/logo/logo.component';
import { GameModule } from './game/game.module';
import { WildcardRoutingModule } from './wildcard-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    NewsComponent,
    FooterComponent,
    LogoComponent,
    TutorialComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    GameModule,
    WildcardRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
/**
 * Allows for retrieving singletons using `AppModule.injector.get(MyService)`
 * This is good to prevent injecting the service as constructor parameter.
 */
  constructor(injector: Injector) {
    setAppInjector(injector);
  }
}
