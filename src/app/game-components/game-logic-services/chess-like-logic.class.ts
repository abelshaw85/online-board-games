import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Square } from "../game-models/square.model";
import { Turn } from "../game-models/turn-actions/turn.model";
import { Winner } from "../game-models/turn-actions/winner.model";
import { GameLogic } from "./game-logic.class";

/*
  Abstract class that contains methods and logic that is true across all chess-like games (Chess, Shogi, etc).
 */
export abstract class ChessLikeLogic extends GameLogic {
  //list of piece names that could be king
  protected kingPieces: string[] = [];

  protected findKing(game: Game, colour: string): Square {
    let kingSquare = null;
    for (let row = 0; row < game.getBoardSize(); row++) {
      for (let col = 0; col < game.getBoardSize(); col++) {
        let kingSquareCandidate = game.squares[row][col];
        let kingPiece = kingSquareCandidate.piece;
        if (kingPiece != null && kingPiece.colour == colour && this.isPieceKing(kingPiece.name)) {
          kingSquare = kingSquareCandidate;
        }
      }
    }
    return kingSquare;
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

  protected isPlayerInCheck(game: Game, colour: string): boolean {
    for (let row of game.squares) {
      for (let square of row) {
        if (square.piece != null && square.piece.colour == colour && this.isPieceKing(square.piece.name)) {
          return square.inCheck;
        }
      }
    }
    return false;
  }

  protected isPieceKing(pieceName: string): boolean {
    return this.kingPieces.includes(pieceName);
  }

  protected unhighlightCheck(game: Game) {
    let boardSize = game.getBoardSize();
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        game.squares[i][j].inCheck = false;
      }
    }
  }

  //checks if player is in check, and sets the piece as "in check" if true
  protected checkForCheck(game: Game, colour: string): boolean {
    //find the king's square so we can track it
    let kingSquare = this.findKing(game, colour);
    this.unhighlightCheck(game); // Remove check from king, will be re-applied if piece is actually in check

    //highlight squares for every enemy piece
    this.unhighlightPossibleMoves(game);
    for (let row = 0; row < game.getBoardSize(); row++) {
      for (let col = 0; col < game.getBoardSize(); col++) {
        let square = game.squares[row][col];
        let piece = square.piece;
        //if we found a piece that is enemy to this player
        if (piece != null && piece.colour != colour) {
          this.highlightPossibleMoves(game, square.position);
        }
      }
    }
    if (kingSquare.danger) {
      kingSquare.inCheck = true;
    }
    return kingSquare.danger;
  }

  protected checkForCheckMate(game: Game, colour: string): boolean {
    // Iterate over pieces
    for (let row = 0; row < game.getBoardSize(); row++) {
      for (let col = 0; col < game.getBoardSize(); col++) {
        let fromSquare = game.squares[row][col];
        // Found friendly piece, see if moving it would undo check
        if (fromSquare.piece != null && fromSquare.piece.colour == colour) {
          let moves = this.getPossibleMoves(game, fromSquare);
          for (let move of moves) {
            // Make copy of the squares
            let fromSquarePiece = Object.assign({}, fromSquare.piece);
            let toSquarePiece = Object.assign({}, game.squares[move.row][move.col].piece);

            game.squares[move.row][move.col].piece = Object.assign({}, fromSquarePiece);
            game.squares[fromSquare.position.row][fromSquare.position.col].piece = null;

            let stillInCheck: boolean = this.checkForCheck(game, colour);
            // Set board back to previous state
            game.squares[fromSquare.position.row][fromSquare.position.col].piece = Object.assign({}, fromSquarePiece);

            // Will typically assign an empty object instead of null, so need to manually set null if object has no properties
            game.squares[move.row][move.col].piece = Object.keys(toSquarePiece).length > 0 ?
              game.squares[move.row][move.col].piece = Object.assign({}, toSquarePiece) :
              game.squares[move.row][move.col].piece = null;

            if (!stillInCheck) {
              this.checkForCheck(game, colour); //re-applies check to checked piece
              return false; //if no longer check, then there is a move to escape check
            }
          }
        }
      }
    }
    return true; // If it gets here, no future piece movement was able to undo check and is therefore checkmate
  }


  // If checkmate, need to add Winner action to turn
  victoryStateCheck(game: Game, turn: Turn, inactiveColour: string) {
    if (this.checkForCheck(game, inactiveColour)) {
      if (this.checkForCheckMate(game, inactiveColour)) {
        alert("Checkmate! You have won!");
        let winningPlayerName = game.player1.colour == game.activeColour ? game.player1.name : game.player2.name;
        this.makeWinner(game, winningPlayerName);
        let winnerAction: Winner = new Winner(winningPlayerName);
        turn.addAction(winnerAction);
      }
    }
  }

  protected isInHand(game: Game, piece: Piece) {
    if (piece.colour == "White") {
      return game.takenByWhite.find((square) => square.piece.name == piece.name) != undefined;
    } else {
      return game.takenByBlack.find((square) => square.piece.name == piece.name) != undefined;
    }
  }

  public highlightPossibleMoves(game: Game, startingPos: RowColPosition) {
    // set current square
    let currentSquare = game.squares[startingPos.row][startingPos.col];
    currentSquare.current = true;

    let possibleMoves = this.getPossibleMoves(game, currentSquare);
    possibleMoves.forEach(move => {
      let squareToMoveTo: Square = game.squares[move.row][move.col];
      if (squareToMoveTo.piece == null) {
        squareToMoveTo.active = true;
      } else if (squareToMoveTo.piece.colour != currentSquare.piece.colour) {
        squareToMoveTo.danger = true;
      }
    });
  }
}
