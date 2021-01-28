import { Component, Input, OnInit } from '@angular/core';
import { Game } from '../../game-models/game.model';
import { Square } from '../../game-models/square.model';

@Component({
  selector: 'app-taken-pieces',
  templateUrl: './taken-pieces.component.html',
  styleUrls: ['./taken-pieces.component.css']
})
export class TakenPiecesComponent implements OnInit {
  @Input() takenPieces: Square[] = [];
  @Input() heading: string = "";
  @Input() showTurn: boolean;
  @Input() game: Game;

  constructor() { }

  ngOnInit(): void {
  }

}
