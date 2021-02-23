import { AppInjector } from "src/app/app-injector";
import { AuthenticationService } from "src/app/auth/auth.service";
import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Square } from "../game-models/square.model";
import { AlertService } from "../../shared/alert.service";
import { PieceBag } from "../services/piece-bag.service";
import { Sound, SoundService } from "../services/sound.service";

export abstract class GameLogic {
  protected authService: AuthenticationService;
  protected pieceBag: PieceBag;
  protected alertService: AlertService;
  protected soundService: SoundService;

  abstract init(game);
  abstract afterTurn(game);
  //Used by components to show/clear possible moves
  abstract highlightPossibleMoves(game: Game, startingPos:RowColPosition);
  abstract highlightPossibleDrops(game: Game, dropPiece: Piece);
  //Used by components to handle moving and dropping
  abstract movePiece(game: Game, from: RowColPosition, to: RowColPosition);
  abstract dropPiece(game: Game, pieceToDrop: Piece, positionToDrop: RowColPosition);
  abstract isFaceDown(colour: string): boolean;
  abstract isActivePiece(game: Game, piece: Piece, position: RowColPosition): boolean;

  constructor() {
    this.authService = AppInjector.get(AuthenticationService);
    this.pieceBag = AppInjector.get(PieceBag);
    this.alertService = AppInjector.get(AlertService);
    this.soundService = AppInjector.get(SoundService);
  }

  makeMove(game: Game, from: RowColPosition, to: RowColPosition) {
    game.squares[to.row][to.col].piece = game.squares[from.row][from.col].piece;
    game.squares[from.row][from.col].piece = null;
    this.soundService.playAudio(Sound.Move);
  }

  protected getPossibleMoves(game: Game, square: Square): RowColPosition[] {
    let possibleMoves: RowColPosition[] = [];
    let position: RowColPosition = square.position;
    square.piece.moves.forEach((move) => {
      let moveRow = move.row;
      let moveCol = move.col;
      while (true) {
        if (this.isWithinBoard(game.getBoardSize(), position.row + moveRow, position.col + moveCol)) {
          let squareToMoveTo: Square = game.squares[position.row + moveRow][position.col + moveCol];
          if (squareToMoveTo.piece != null && square.piece.colour == squareToMoveTo.piece.colour) {
            // if square has a piece from the same player, cannot move to this square
            return;
          }
          possibleMoves.push(new RowColPosition(position.row + moveRow, position.col + moveCol));
          if (squareToMoveTo.piece == null && square.piece.extended) { //can only continue moving in this direction if the current square is empty
            if (moveRow < 0) {
              moveRow -= 1;
            }
            if (moveRow > 0) {
              moveRow += 1;
            }
            if (moveCol < 0) {
              moveCol -= 1;
            }
            if (moveCol > 0) {
              moveCol += 1;
            }
          } else {
            return; //acts like continue
          }
        } else {
          return;
        }
      }
    });
    return possibleMoves;
  }

  makeTake(game: Game, takingColour: string, takenPieceName: string) {
    let isFaceDown = this.isFaceDown(takingColour);
    let takenPiece = this.pieceBag.getPieceByName(takenPieceName, isFaceDown);
    // Only Shogi pieces change colour when taken
    if (takenPieceName.startsWith("SHO")) {
      takenPiece.colour = takingColour;
    } else {
      takenPiece.colour = takingColour == "White" ? "Black" : "White";
    }
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
    let unpromotedPieceName = game.squares[pieceLocation.row][pieceLocation.col].piece.name;
    let isFaceDown = this.isFaceDown(pieceColour);
    //Set promoted piece to null if name is null (to turn piece into empty square)
    let promotedPiece = promotionPieceName == null ? null : this.pieceBag.getPieceByName(promotionPieceName, isFaceDown);
    if (promotedPiece != null) {
      promotedPiece.colour = pieceColour;
    }
    game.squares[pieceLocation.row][pieceLocation.col].piece = promotedPiece; //replace piece with promoted piece
    if (promotionPieceName != null && !promotionPieceName.endsWith("-Moved") && (promotedPiece.promoted || unpromotedPieceName.startsWith("CHE-Pawn") || unpromotedPieceName.startsWith("DRA-Piece"))) {
      this.soundService.playAudio(Sound.Promote);
    }
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
    let loserName = game.player1.username == winnerName ? game.player2.username : game.player1.username;
    if (this.authService.getLoggedInUserName() == winnerName) {
      this.alertService.openAlert("Congratulations!", "You have won the game!");
      this.soundService.playAudio(Sound.Winner);
    } else if (this.authService.getLoggedInUserName() == loserName) {
      this.alertService.openAlert("You Lose", "You have lost the game.");
      this.soundService.playAudio(Sound.Loser);
    }
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
}
