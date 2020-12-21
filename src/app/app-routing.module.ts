import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { BoardComponent } from './game-components/board/board.component';
import { HomeComponent } from './home/home.component';
import { WebSocketComponent } from './web-socket/web-socket/web-socket.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "board", component: BoardComponent },
  { path: "web-socket", component: WebSocketComponent },
  { path: "login", component: LoginComponent },
  { path: "logout", component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
