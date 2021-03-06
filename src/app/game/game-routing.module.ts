import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth-guard.service";
import { BoardComponent } from "./board/board.component";
import { JoinGamesComponent } from "./ui-components/join-games/join-games.component";
import { PanelComponent } from "./ui-components/panel/panel.component";

const routes: Routes = [
  { path: "", canActivate: [AuthGuard], component: PanelComponent },
  { path: "join", canActivate: [AuthGuard], component: JoinGamesComponent },
  { path: ":id", canActivate: [AuthGuard], component: BoardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule {
}
