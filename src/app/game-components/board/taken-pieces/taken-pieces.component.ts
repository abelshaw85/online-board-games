import { Component, Input, OnInit } from '@angular/core';
import { Game } from '../../game-models/game.model';
import { Player } from '../../game-models/player.model';
import { Square } from '../../game-models/square.model';
import { faStar } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-taken-pieces',
  templateUrl: './taken-pieces.component.html',
  styleUrls: ['./taken-pieces.component.css']
})
export class TakenPiecesComponent implements OnInit {
  @Input() takenPieces: Square[] = [];
  @Input() player: Player;
  @Input() game: Game;
  faStar = faStar;

  constructor() { }

  ngOnInit(): void {
  }

  headingText(): string {
    return this.player.username + "\n" + "[" + this.player.colour + "]"
  }

  get showTurn(): boolean {
    return this.game.activeColour == this.player.colour;
  }

}
