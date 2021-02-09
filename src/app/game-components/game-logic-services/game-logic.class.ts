import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { CustomAlertDialogue } from "src/app/shared/custom-alert/custom-alert.component";
import { environment } from "src/environments/environment";
import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Square } from "../game-models/square.model";
import { Turn } from "../game-models/turn-actions/turn.model";
import { PieceBag } from "../services/piece-bag.service";

export abstract class GameLogic {

  //Used by components to show/clear possible moves
  abstract highlightPossibleMoves(game: Game, startingPos:RowColPosition);
  abstract highlightPossibleDrops(game: Game, dropPiece: Piece);
  //Used by components to handle moving and dropping
  abstract movePiece(game: Game, from: RowColPosition, to: RowColPosition);
  abstract dropPiece(game: Game, pieceToDrop: Piece, positionToDrop: RowColPosition);
  abstract isFaceDown(colour: string): boolean;

  constructor(protected pieceBag: PieceBag, protected http: HttpClient, protected dialog: MatDialog) {}

  makeMove(game: Game, from: RowColPosition, to: RowColPosition) {
    game.squares[to.row][to.col].piece = Object.assign({}, game.squares[from.row][from.col].piece);
    game.squares[from.row][from.col].piece = null;
  }

  makeTake(game: Game, takingColour: string, takenPieceName: string) {
    let isFaceDown = this.isFaceDown(takingColour);
    let takenPiece = this.pieceBag.getPieceByName(takenPieceName, isFaceDown);
    takenPiece.colour = takingColour;
    takenPiece.taken = true;
    let square: Square = new Square(takenPiece);
    if (takingColour == "White") {
      game.takenByWhite.push(square);
    } else {
      game.takenByBlack.push(square);
    }
  }

  makePromote(game: Game, pieceLocation: RowColPosition, promotionPieceName: string) {
    let pieceColour = game.squares[pieceLocation.row][pieceLocation.col].piece.colour;
    let isFaceDown = this.isFaceDown(pieceColour);
    let promotedPiece = this.pieceBag.getPieceByName(promotionPieceName, isFaceDown);
    promotedPiece.colour = pieceColour;
    game.squares[pieceLocation.row][pieceLocation.col].piece = promotedPiece; //replace piece with promoted piece
  }

  makeDrop(game: Game, dropPos: RowColPosition, droppingColour: string, droppingPieceName: string) {
    let isFaceDown = this.isFaceDown(droppingColour);
    let pieceToDrop = this.pieceBag.getPieceByName(droppingPieceName, isFaceDown);
    pieceToDrop.colour = droppingColour;
    game.squares[dropPos.row][dropPos.col].piece = pieceToDrop;
    this.removeFromHand(game, pieceToDrop);
  }

  makeWinner(game: Game, winnerName: string) {
    game.winnerName = winnerName;
    game.status = "Closed";
  }

  private removeFromHand(game: Game, piece: Piece) {
    if (piece.colour == "White") {
      let index: number = game.takenByWhite.findIndex((square) => {
        return square.piece.name == piece.name;
      });
      game.takenByWhite.splice(index, 1);

    } else {
      let index: number = game.takenByBlack.findIndex((square) => {
        return square.piece.name == piece.name;
      });
      game.takenByBlack.splice(index, 1);
    }
  }

  isPossibleMove(game: Game, to: RowColPosition): boolean {
    if (to == null) {
      return false;
    }
    if (this.isWithinBoard(game.getBoardSize(), to.row, to.col)) {
      return (game.squares[to.row][to.col].active ||
            game.squares[to.row][to.col].danger);
    }
    return false;
  }

  protected isWithinBoard(boardSize: number, row: number, col: number): boolean {
    return (row >= 0 && row < boardSize) && (col >= 0 && col < boardSize);
  }

  postTurn(turn: Turn) {
    return this.http.post<Turn>(environment.serverUrl + "/makeTurn", turn);
  }

  unhighlightPossibleMoves(game: Game) {
    let boardSize = game.getBoardSize();
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        game.squares[i][j].active = false;
        game.squares[i][j].danger = false;
        game.squares[i][j].current = false;
      }
    }
    game.takenByBlack.forEach((square) => {
      square.active = false;
      square.danger = false;
      square.current = false;
    });
    game.takenByWhite.forEach((square) => {
      square.active = false;
      square.danger = false;
      square.current = false;
    });
  }

  openAlert(heading: string, text: string) {
    const dialogRef = this.dialog.open(CustomAlertDialogue, {
      width: '30%',
      data: {
        heading: heading,
        text: text
      }
    });
  }
}
