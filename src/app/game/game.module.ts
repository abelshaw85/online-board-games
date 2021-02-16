import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { BoardComponent } from "./board/board.component";
import { PieceComponent } from "./board/piece/piece.component";
import { SquareComponent } from "./board/square/square.component";
import { TakenPiecesComponent } from "./board/taken-pieces/taken-pieces.component";
import { ChessPromoteConfirmDialog } from "./game-logic-services/dialogs/chess-promote-alert/chess-promote-confirm.component";
import { SelectablePieceComponent } from "./game-logic-services/dialogs/chess-promote-alert/selectable-piece/selectable-piece.component";
import { JoinGamesComponent } from "./ui-components/join-games/join-games.component";
import { PanelComponent } from "./ui-components/panel/panel.component";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GameRoutingModule } from "./game-routing.module";


@NgModule({
  declarations: [
    BoardComponent,
    SquareComponent,
    PieceComponent,
    TakenPiecesComponent,
    PanelComponent,
    JoinGamesComponent,
    ChessPromoteConfirmDialog,
    SelectablePieceComponent
  ],
  imports: [
    SharedModule,
    DragDropModule,
    GameRoutingModule
  ],
  exports: [
    BoardComponent,
    SquareComponent,
    PieceComponent,
    TakenPiecesComponent,
    PanelComponent,
    JoinGamesComponent,
    ChessPromoteConfirmDialog,
    SelectablePieceComponent
  ]
})
export class GameModule {

}
