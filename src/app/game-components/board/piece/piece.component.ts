import { Component, Input, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/auth/auth.service';
import { Game } from '../../game-models/game.model';
import { Player } from '../../game-models/player.model';
import { GameManagerService } from '../../services/game-manager.service';
import { RowColPosition } from '../../game-models/row-col-position.model';
import { Piece } from '../../game-models/piece.model';

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css']
})
export class PieceComponent implements OnInit {
  @Input() piece: Piece;
  @Input() position: RowColPosition;
  @Input() game: Game;

  constructor(private gameManager: GameManagerService,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
  }

  onDragStart(event) {
    if (this.piece.taken) {
      this.game.highlightDrops(this.piece);
    } else {
      this.game.highlightPossibleMoves(this.position);
    }
  }

  onDragEnd(event) {

  }

  //could this get active status from parent square object?
  isActive(): boolean {
    return this.game.status != "Closed" && this.piece !== null &&
      this.piece.colour === this.gameManager.getTurnColour(this.game.gameId) &&
      this.authService.getLoggedInUserName() == this.gameManager.getPlayerByColour(this.game.gameId, this.piece.colour).name;
  }

  getPieceName() {
    if (this.piece != null) {
      return this.piece.name.split("-")[1]; //remove game-type prefix, only display piece name
    }
  }

  getPieceUrl() {
    const piecePrefix = this.piece.name.split("-")[0];
    switch (piecePrefix) {
      case "SHO":
        return this.piece.imgUrl;
      case "CHE":
        if (this.piece.colour == "White") {
          return this.piece.imgUrl + "-wht.svg";
        } else {
          return this.piece.imgUrl + "-blk.svg";
        }
    }
  }

}