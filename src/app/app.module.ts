import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BoardComponent } from './game-components/board/board.component';
import { SquareComponent } from './game-components/board/square/square.component';
import { PieceComponent } from './game-components/board/piece/piece.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TakenPiecesComponent } from './game-components/board/taken-pieces/taken-pieces.component';
import { PieceBag } from './game-components/services/piece-bag.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { WebSocketComponent } from './web-socket/web-socket.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { HttpInterceptorService } from './auth/http-interceptor.service';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './auth/auth-guard.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { WebSocketService } from './web-socket/web-socket.service';
import { PanelComponent } from './game-components/ui-components/panel/panel.component';
import { JoinGamesComponent } from './game-components/ui-components/join-games/join-games.component';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
import { HeaderComponent } from './main-components/header/header.component';
import { CustomTableComponent } from './shared/custom-table/custom-table.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    SquareComponent,
    PieceComponent,
    TakenPiecesComponent,
    WebSocketComponent,
    LoginComponent,
    HomeComponent,
    RegisterComponent,
    PanelComponent,
    JoinGamesComponent,
    LoadingSpinnerComponent,
    HeaderComponent,
    CustomTableComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DragDropModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    PieceBag,
    AuthGuard,
    WebSocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
