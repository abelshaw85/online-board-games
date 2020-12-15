import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { Piece } from '../piece/piece.model';
import { GameService } from '../services/game.service';
import { RowColPosition } from './row-col-position.model';
import { Square } from './square.model';

@Component({
  selector: 'app-square',
  templateUrl: './square.component.html',
  styleUrls: ['./square.component.css']
})
export class SquareComponent implements OnInit {
  @Input() square: Square;

  constructor(private gameService: GameService) {
  }

  ngOnInit(): void {
  }

  drop(event: CdkDragDrop<string[]>) {
    let movingPiece: Piece = event["previousContainer"]["data"]["piece"];
    let from: RowColPosition = event.previousContainer.data["position"];
    let to: RowColPosition = event.container.data["position"]; //Could also just retrieve pos from local square variable!
    if (this.gameService.isPossibleMove(to)) {
      if (movingPiece.taken) {
        this.gameService.dropPiece(movingPiece, to);
      }
      else if (from != to) {
        this.gameService.movePiece(from, to);
      } else {
        console.log("INVALID MOVE");
        this.gameService.unhighlightPossibleMoves();
      }
    } else {
      this.gameService.unhighlightPossibleMoves();
    }
  }

  hasActivePiece(): boolean {
    return this.square.piece != null && this.square.piece.colour === this.gameService.getActiveColour();
  }
}
