import { Injectable } from "@angular/core";
import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { PieceBag } from "../services/piece-bag.service";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Square } from "../game-models/square.model";
import { IGameLogic } from "./game-logic.interface";
import { Turn } from "../game-models/turn-actions/turn.model";
import { Move } from "../game-models/turn-actions/move.model";
import { Take } from "../game-models/turn-actions/take.model";
import { Promote } from "../game-models/turn-actions/promote.model";
import { HttpClient } from "@angular/common/http";
import { Drop } from "../game-models/turn-actions/drop.model";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShogiLogicService implements IGameLogic {

  constructor(private pieceBag: PieceBag,
    private http: HttpClient) {}

  movePiece(game: Game, from: RowColPosition, to: RowColPosition) {
    //handle move
    //handle promote

    let turn: Turn = new Turn(game.gameId); // Create new Turn object that will be populated by Actions.
    let startedInCheck = this.isPlayerInCheck(game, game.activeColour);

    // If square has a piece to take, add it to player's hand
    if (game.squares[to.row][to.col].piece != null) {
      let capturedPiece: Piece = game.squares[to.row][to.col].piece;

      //Captured pieces must unpromote
      if (capturedPiece.promoted) {
        let unpromotedPieceName = this.pieceBag.unpromotePiece(capturedPiece.name).name;
        this.makePromote(game, to, unpromotedPieceName); //swaps piece for the unpromoted piece
        capturedPiece = game.squares[to.row][to.col].piece; //piece at this location will now be unpromoted piece
      }
      this.makeTake(game, game.activeColour, capturedPiece.name); //adds piece to the capturing player's hand

      // Add Take to the list of actions
      let takeAction: Take = new Take(game.activeColour, capturedPiece.name);
      turn.addAction(takeAction);
    }

    this.makeMove(game, from, to); //replaces piece at "to" with piece from "from"
    //Add move to list of actions
    let moveAction: Move = new Move(from, to);
    turn.addAction(moveAction);

    // replace piece with promoted piece if applicable
    let pieceToCheckForPromotion: Piece = game.squares[to.row][to.col].piece;
    if (this.canPromote(game.getBoardSize(), to.row, pieceToCheckForPromotion)) {
      if (this.isEnforcedPromote(game.getBoardSize(), to.row, pieceToCheckForPromotion) || confirm("This piece can be promoted to " + pieceToCheckForPromotion.promotionPiece + ", would you like to promote this piece?")) {
        this.makePromote(game, to, pieceToCheckForPromotion.promotionPiece); //swaps piece for the promoted piece
        pieceToCheckForPromotion = game.squares[to.row][to.col].piece; //get updated piece
        // Add Promotion to the list of actions
        let promoteAction: Promote = new Promote(to, pieceToCheckForPromotion.name);
        turn.addAction(promoteAction);
      }
    }

    this.unhighlightCheck(game);
    if (this.checkForCheck(game)) {
      if (this.isCheckMate(game)) {
        alert("Checkmate!");
      } else if (this.isPlayerInCheck(game, game.activeColour)) {
        if (startedInCheck) {
          alert("You failed to get yourself out of check! You have lost the game.");
        } else {
          alert("You put yourself in check! You have lost the game.");
        }
        return;
      }
    }
    game.toggleTurn();

    //Send full turn to the server
    this.postTurn(turn).subscribe((response) => {
      console.log(response);
    });
  }

  makeMove(game: Game, from: RowColPosition, to: RowColPosition) {
    game.squares[to.row][to.col].piece = Object.assign({}, game.squares[from.row][from.col].piece);
    game.squares[from.row][from.col].piece = null;
    console.log("piece in new pos:");
    console.log(game.squares[to.row][to.col].piece.name);
  }

  makeTake(game: Game, takingColour: string, takenPieceName: string) {
    let takenPiece = this.pieceBag.getPieceByName(takenPieceName, takingColour == "White");
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
    let promotedPiece = this.pieceBag.getPieceByName(promotionPieceName, pieceColour == "White");
    promotedPiece.colour = pieceColour;
    game.squares[pieceLocation.row][pieceLocation.col].piece = promotedPiece; //replace piece with promoted piece
  }

  makeDrop(game: Game, dropPos: RowColPosition, droppingColour: string, droppingPieceName: string) {
    let pieceToDrop = this.pieceBag.getPieceByName(droppingPieceName, droppingColour == "White");
    pieceToDrop.colour = droppingColour;
    game.squares[dropPos.row][dropPos.col].piece = pieceToDrop;
    this.removeFromHand(game, pieceToDrop);
  }

  highlightPossibleMoves(game: Game, startingPos: RowColPosition) {
    // set current square
    let currentSquare = this.getSquare(game, startingPos);
    currentSquare.current = true;

    this.getPossibleMoves(game, currentSquare).forEach(move => {
      let squareToMoveTo: Square = game.squares[move.row][move.col];
      if (squareToMoveTo.piece == null) {
        squareToMoveTo.active = true;
      } else if (squareToMoveTo.piece.colour != currentSquare.piece.colour) {
        squareToMoveTo.danger = true;
      }
    });
  }

  highlightPossibleDrops(game: Game, dropPiece: Piece) {
    let copy = Object.assign({}, dropPiece);
    let pawnCounts = new Array(game.squares.length).fill(0);
    // pawns cannot drop in columns where 2 pawns of the same colour already exist
    if (dropPiece.name == "Pawn") {
      for (let row = 0; row < game.squares.length; row++) {
        for (let col = 0; col < game.squares[row].length; col++) {
          if (game.squares[row][col].piece != null && game.squares[row][col].piece.name == "Pawn" && game.squares[row][col].piece.colour == dropPiece.colour) {
            pawnCounts[col] += 1;
          }
        }
      }
    }
    let isOmnidirectional: boolean = (dropPiece.moves.find((move) => move.row > 0) != undefined && dropPiece.moves.find((move) => move.row < 0) != undefined);
    for (let row = 0; row < game.squares.length; row++) {
      for (let col = 0; col < game.squares[row].length; col++) {
        if (game.squares[row][col].piece == null && pawnCounts[col] < 2) {
          if (!isOmnidirectional) {
            game.squares[row][col].piece = copy;
            if (this.getPossibleMoves(game, game.squares[row][col]).length > 0) {// if a piece can only move forwards, it must have a valid move after being dropped.
              game.squares[row][col].active = true;
            }
            game.squares[row][col].piece = null;
          } else {
            game.squares[row][col].active = true;
          }
        }
      }
    }
  }

  isPossibleMove(game: Game, to: RowColPosition): boolean {
    if (this.isWithinBoard(game.getBoardSize(), to.row, to.col)) {
      return (game.squares[to.row][to.col].active ||
            game.squares[to.row][to.col].danger);
    }
    return false;
  }

  dropPiece(game: Game, pieceToDrop: Piece, positionToDrop: RowColPosition) {
    let turn: Turn = new Turn(game.gameId);
    if (this.isInHand(game, pieceToDrop) && game.squares[positionToDrop.row][positionToDrop.col].piece == null) {
      this.makeDrop(game, positionToDrop, pieceToDrop.colour, pieceToDrop.name); //drops piece and removes from player's hand
      this.checkForCheck(game);
      game.toggleTurn();

      let dropAction: Drop = new Drop(positionToDrop, pieceToDrop.colour, pieceToDrop.name);
      turn.addAction(dropAction);
      //send drop turn to server
      this.postTurn(turn).subscribe((response) => {
        console.log(response);
      });
    }
  }

  private isInHand(game: Game, piece: Piece) {
    if (piece.colour == "White") {
      return game.takenByWhite.find((square) => square.piece.name == piece.name) != undefined;
    } else {
      return game.takenByBlack.find((square) => square.piece.name == piece.name) != undefined;
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

  private getPossibleMoves(game: Game, square: Square): RowColPosition[] {
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

  postTurn(turn: Turn) {
    return this.http.post<Turn>(environment.serverUrl + "/makeTurn", turn);
  }

  private canPromote(boardSize: number, row: number, piece: Piece): boolean {
    if (piece.promotionPiece != null) {
      // if a white piece is in the bottom 3 rows
      if (piece.colour == "White" && row >= boardSize - 3) {
        return true;
      // if a black piece is in the top 3 rows
      } else if (piece.colour == "Black" && row <= 2) {
        return true;
      }
    }
    return false;
  }

  private isCheckMate(game: Game): boolean {
    let checkedColour: string;
    for (let row of game.squares) {
      for (let square of row) {
        if (square.inCheck) {
          checkedColour = square.piece.colour;
          return;
        }
      }
    }
    for (let row of game.squares) {
      for (let square of row) {
        if (square.piece != null && square.piece.colour == checkedColour) {
          let possibleMoves: RowColPosition[] = this.getPossibleMoves(game, Object.assign({}, square));
          for (let move of possibleMoves) {
            //make copy of the squares
            let fromSquarePiece = Object.assign({}, square.piece);
            let toSquarePiece = Object.assign({}, game.squares[move.row][move.col].piece);

            game.squares[move.row][move.col].piece = Object.assign({}, fromSquarePiece);
            game.squares[square.position.row][square.position.col].piece = null;

            let stillInCheck: boolean = this.checkForCheck(game);
            //set board back to previous state
            game.squares[square.position.row][square.position.col].piece = Object.assign({}, fromSquarePiece);

            // Will typically assign an empty object instead of null, so need to manually set null if object has no properties
            game.squares[move.row][move.col].piece = Object.keys(toSquarePiece).length > 0 ?
              game.squares[move.row][move.col].piece = Object.assign({}, toSquarePiece) :
              game.squares[move.row][move.col].piece = null;

            if (!stillInCheck) {
              this.checkForCheck(game); //re-applies check to checked piece
              return false; //if no longer check, then there is a move to escape check
            }
          }
        }
      }
    }
    return true;
  }

  private checkForCheck(game: Game): boolean {
    this.unhighlightPossibleMoves(game); //Reset board to remove previous highlights
    let kingPositions: RowColPosition[] = [];
    game.squares.forEach((row) => {
      row.forEach((square) => {
        if (square.piece != null && square.piece != undefined) {
          this.highlightPossibleMoves(game, square.position);
          if (square.piece.name == "King General" || square.piece.name == "Jeweled General") {
            kingPositions.push(Object.assign({}, square.position));
          }
        }
      });
    });
    let kingSquares: Square[] = [];
    kingPositions.forEach((kingSquarePosition) => {
      kingSquares.push(Object.assign({}, game.squares[kingSquarePosition.row][kingSquarePosition.col])); //make a copy of the king squares before removing highlight
    });
    this.unhighlightPossibleMoves(game); //clear board before applying in-check highlights
    this.unhighlightCheck(game);
    let boardContainsCheck = false;
    kingSquares.forEach((kingSquare) => {
      if (kingSquare.danger) { //if copy is in danger, add in-check to original
        game.squares[kingSquare.position.row][kingSquare.position.col].inCheck = true;
        boardContainsCheck = true;
      } else {
        game.squares[kingSquare.position.row][kingSquare.position.col].inCheck = false;
      }
    });
    return boardContainsCheck;
  }

  private unhighlightCheck(game: Game) {
    let boardSize = game.getBoardSize();
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        game.squares[i][j].inCheck = false;
      }
    }
  }

  private isWithinBoard(boardSize: number, row: number, col: number): boolean {
    return (row >= 0 && row < boardSize) && (col >= 0 && col < boardSize);
  }

  private getSquare(game: Game, position: RowColPosition): Square {
    return game.squares[position.row][position.col];
  }

  private isPlayerInCheck(game: Game, colour: string): boolean {
    for (let row of game.squares) {
      for (let square of row) {
        if (square.piece != null && square.piece.colour == colour && (square.piece.name == "King General" || square.piece.name == "Jeweled General")) {
          return square.inCheck;
        }
      }
    }
    return false;
  }

  private isEnforcedPromote(boardSize: number, row: number, piece: Piece): boolean {
    if (piece.enforcedPromotionRow >= 0) {
      if (piece.colour == "White" && row >= (boardSize - 1 - piece.enforcedPromotionRow)) {
        return true;
      } else if (piece.colour == "Black" && row <= (0 + piece.enforcedPromotionRow)) {
        return true;
      }
    }
  }
}
