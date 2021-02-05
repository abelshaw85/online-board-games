import { Injectable } from "@angular/core";
import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Square } from "../game-models/square.model";
import { HttpClient } from "@angular/common/http";
import { PieceBag } from "../services/piece-bag.service";
import { ChessLikeLogic } from "./chess-like-logic.class";

/*
  Concrete class that implements Chess-specific logic. Uses ChessLike as a template for logic that is true across Shogi, Chess, and other chess-like games
*/
@Injectable({
  providedIn: 'root'
})
export class ChessLogicService extends ChessLikeLogic {

  protected getPossibleMoves(game: Game, square: Square): RowColPosition[] {
    // if pawn, get special pawn moves
    // if king/rook, get special castling moves
    // else, get moves from superclass
    let possibleMoves: RowColPosition[] = [];
    if (square.piece.name == "CHE-Pawn") {
      possibleMoves = this.getPossiblePawnMoves(game, square);
      return possibleMoves;
    } else {
      possibleMoves = super.getPossibleMoves(game, square);
    }
    return possibleMoves;
  }

  private getPossiblePawnMoves(game, square): RowColPosition[] {
    let possibleMoves: RowColPosition[] = super.getPossibleMoves(game, square); // Populate possible moves with pawn's default move (only 1 move by default)
    const squareRow = square.position.row;
    const squareCol = square.position.col;

    // If there is a move, check if the piece on that square is empty
    if (possibleMoves.length > 0) {
      let move = possibleMoves[0];
      // If there is a piece present on this square, remove the move
      if (game.squares[move.row][move.col].piece != null) {
        possibleMoves = [];
      }
    }

    if (square.piece.colour == "Black" && squareRow == 1 && game.squares[squareRow + 1][squareCol].piece == null && game.squares[squareRow + 2][squareCol].piece == null) {
      // If black, add an extra tile "down"
      possibleMoves.push(new RowColPosition(square.position.row + 2, square.position.col));
    } else if (square.piece.colour == "White" && squareRow == game.getBoardSize() - 2 && game.squares[squareRow - 1][squareCol].piece == null && game.squares[squareRow - 2][squareCol].piece == null) {
      possibleMoves.push(new RowColPosition(square.position.row -2, square.position.col));
    }

    // Add diagonals if opponent piece is present
    let takingRow = 0;
    let takingCol = square.position.col - 1;
    // Set taking row depending on whether piece is black or white
    if (square.piece.colour == "Black") {
      takingRow = square.position.row + 1;
    } else {
      takingRow = square.position.row - 1;
    }
    // Check diagonally left of piece

    if (this.isWithinBoard(game.getBoardSize(), takingRow, takingCol)) {
      const pieceToTake = game.squares[takingRow][takingCol].piece;
      if (pieceToTake != null && pieceToTake.colour != game.activeColour) {
        possibleMoves.push(new RowColPosition(takingRow, takingCol));
      }
    }
    takingCol = square.position.col + 1;
    // Check square diagonally and right of piece
    if (this.isWithinBoard(game.getBoardSize(), takingRow, takingCol)) {
      const pieceToTake = game.squares[takingRow][takingCol].piece;
      if (pieceToTake != null && pieceToTake.colour != game.activeColour) {
        possibleMoves.push(new RowColPosition(takingRow, takingCol));
      }
    }

    return possibleMoves;
  }

  constructor(protected http: HttpClient, protected pieceBag: PieceBag) {
    super(pieceBag, http);
    this.kingPieces.push("CHE-King");
  }

  movePiece(game: Game, from: RowColPosition, to: RowColPosition) {
    //todo
    game.makeMove(from, to);
    this.unhighlightPossibleMoves(game);
    game.toggleTurn();
  }

  highlightPossibleDrops(game: Game, dropPiece: Piece) {

  }

  dropPiece(game: Game, pieceToDrop: Piece, positionToDrop: RowColPosition) {

  }

  private canPromote(boardSize: number, row: number, piece: Piece): boolean {
    return false;
  }

  private isEnforcedPromote(boardSize: number, row: number, piece: Piece): boolean {
    return false;
  }
}
