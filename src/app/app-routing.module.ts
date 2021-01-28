import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth-guard.service';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { BoardComponent } from './game-components/board/board.component';
import { JoinGamesComponent } from './game-components/ui-components/join-games/join-games.component';
import { PanelComponent } from './game-components/ui-components/panel/panel.component';
import { HomeComponent } from './home/home.component';
import { WebSocketComponent } from './web-socket/web-socket.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "board", canActivate: [AuthGuard], component: BoardComponent },
  { path: "games/home", canActivate: [AuthGuard], component: PanelComponent },
  { path: "games/join", canActivate: [AuthGuard], component: JoinGamesComponent },
  { path: "games/:id", canActivate: [AuthGuard], component: BoardComponent },
  { path: "web-socket", component: WebSocketComponent },
  { path: "login", component: LoginComponent },
  { path: "logout", component: LoginComponent },
  { path: "register", component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
