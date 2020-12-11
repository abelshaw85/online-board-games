import { Component, Input, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { RowColPosition } from '../square/row-col-position.model';
import { Piece } from './piece.model';

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css']
})
export class PieceComponent implements OnInit {
  @Input() piece: Piece;
  @Input() position: RowColPosition;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

  onDragStart(event) {
    if (this.piece.taken) {
      this.gameService.highlightDrops();
    } else {
      this.gameService.highlightPossibleMoves(this.piece.name, this.position, this.piece.player);
    }
  }

  onDragEnd(event) {

  }

  isActive(): boolean {
    return this.gameService.getActivePlayer() == this.piece.player;
  }

}
