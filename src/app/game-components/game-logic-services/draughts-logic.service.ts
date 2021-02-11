import { Injectable } from "@angular/core";
import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Square } from "../game-models/square.model";
import { Move } from "../game-models/turn-actions/move.model";
import { Promote } from "../game-models/turn-actions/promote.model";
import { Take } from "../game-models/turn-actions/take.model";
import { Winner } from "../game-models/turn-actions/winner.model";

import { GameLogic } from "./game-logic.class";

@Injectable({
  providedIn: 'root'
})
export class DraughtsLogicService extends GameLogic {
  private activePiecePosition: RowColPosition = null;

  highlightPossibleMoves(game: Game, startingPos: RowColPosition) {
    // set current square
    let currentSquare = game.squares[startingPos.row][startingPos.col];
    currentSquare.current = true;

    let possibleMoves = this.getPossibleMoves(game, currentSquare);
    possibleMoves.forEach(move => {
      let squareToMoveTo: Square = game.squares[move.row][move.col];
      squareToMoveTo.active = true;
      // If the difference between the row's movement is greater than 1, then this is a jump move and the piece between must be highlighted as in danger
      if (Math.abs(startingPos.row - move.row) > 1) {
        let betweenPos = this.getPositionBetween(startingPos, move);
        game.squares[betweenPos.row][betweenPos.col].danger = true;
      }
    });
  }

  highlightPossibleDrops(game: Game, dropPiece: Piece) {
    return; // cannot drop pieces in draughts
  }

  dropPiece(game: Game, pieceToDrop: Piece, positionToDrop: RowColPosition) {
    return; // cannot drop pieces in draughts
  }

  movePiece(game: Game, from: RowColPosition, to: RowColPosition) {
    if (!game.squares[to.row][to.col].danger) {
      // Move the piece
      this.makeMove(game, from, to);
      let move = new Move(from, to);
      game.addTurnAction(move);

      // Promote to king if they reached the end of the board
      let piece = game.squares[to.row][to.col].piece;
      if (piece.name == "DRA-Piece" && (piece.colour == "White" && to.row == (game.getBoardSize() - 1)) || (piece.colour == "Black" && to.row == 0)) {
        this.makePromote(game, to, piece.promotionPiece);
        let promote = new Promote(to, piece.promotionPiece);
        game.addTurnAction(promote);
      }

      //If this is a jump move, take the piece between the jump positions
      if (Math.abs(from.row - to.row) > 1) {
        let betweenPos = this.getPositionBetween(from, to);
        let takenSquare = game.squares[betweenPos.row][betweenPos.col];
        console.log(takenSquare);
        this.makeTake(game, game.activeColour, takenSquare.piece.name);
        let take = new Take(game.activeColour, takenSquare.piece.name);
        game.addTurnAction(take);

        //TODO: consider how this setting of null can be sent to server
        this.makePromote(game, takenSquare.position, null);
        let promote = new Promote(takenSquare.position, null);
        game.addTurnAction(promote);

        //check if the piece could take again
        let newMoves: RowColPosition[] = this.getPossibleMoves(game, game.squares[to.row][to.col]);
        this.activePiecePosition = null; //reset this to "empty" position
        for(let newMove of newMoves) {
          // Found a jump move, player can continue to move
          if (Math.abs(to.row - newMove.row) > 1) {
            this.activePiecePosition = to;
            break;
          }
        }
      }
      if (this.activePiecePosition == null) {
        let opposingColour = game.activeColour == "White" ? "Black" : "White";
        // if player has won
        if (this.checkForLoss(game, opposingColour)) {
          let thisPlayer = game.getPlayerByColour(game.activeColour).name;
          let winner: Winner = new Winner(thisPlayer);
          game.addTurnAction(winner);
          this.makeWinner(game, thisPlayer);
        }
        game.toggleTurn();
        game.postTurn();
      }
    }
    //post turn if action complete (no other pieces can be taken)


    this.unhighlightPossibleMoves(game);
  }

  getNextPositionDiagonally(from: RowColPosition, to: RowColPosition) {
    let nextRow = to.row;
    let nextCol = to.col;

    if (to.row > from.row) {
      nextRow += 1;
    }
    else {
      nextRow -= 1;
    }

    if (to.col > from.col) {
      nextCol += 1;
    }
    else {
      nextCol -= 1;
    }
    return new RowColPosition(nextRow, nextCol);
  }

  checkForLoss(game: Game, colour: string): boolean {
    let pieceCount = 0;
    let hasPossibleMove = false;

    for (let row = 0; row < game.getBoardSize(); row++) {
      for (let col = 0; col < game.getBoardSize(); col++) {
        let piece = game.squares[row][col].piece;
        if (piece != null && piece.colour == colour) {
          pieceCount++;
          if (this.getPossibleMoves(game, game.squares[row][col]).length > 0) {
            hasPossibleMove = true; //enemy player has at least 1 piece with possible moves
            break;
          }
        }
      }
    }
    return pieceCount == 0 && !hasPossibleMove; //if no pieces or moves, player has lost
  }

  getPositionBetween(from: RowColPosition, to: RowColPosition) {
    let betweenRow = to.row;
    let betweenCol = to.col;

    if (to.row > from.row) {
      betweenRow -= 1;
    }
    else {
      betweenRow += 1;
    }

    if (to.col > from.col) {
      betweenCol -= 1;
    }
    else {
      betweenCol += 1;
    }
    return new RowColPosition(betweenRow, betweenCol);
  }

  isFaceDown(colour: string): boolean {
    return colour == "White";
  }

  isActivePiece(game: Game, piece: Piece, position: RowColPosition): boolean {
    return piece != null &&
      !piece.taken &&
      (this.activePiecePosition == null || position == this.activePiecePosition) &&
      piece.colour == game.activeColour;
  }

  protected getPossibleMoves(game: Game, square: Square): RowColPosition[] {
    let possibleMoves: RowColPosition[] = [];
    let position: RowColPosition = square.position;
    square.piece.moves.forEach((move) => {
      let movePosition = new RowColPosition(position.row + move.row, position.col + move.col);
      if (this.isWithinBoard(game.getBoardSize(), movePosition.row, movePosition.col)) {
        let pieceAtMove: Piece = game.squares[movePosition.row][movePosition.col].piece;
        //if there is a piece at this position, it will either block or be a possible take
        if (pieceAtMove != null) {
          if (square.piece.colour == pieceAtMove.colour) {
            return; //piece is same colour, moving piece is blocked
          } else {
            // piece is enemy piece, check if can be jumped over
            let jumpPos = this.getNextPositionDiagonally(square.position, movePosition);
            if (this.isWithinBoard(game.getBoardSize(), jumpPos.row, jumpPos.col) && game.squares[jumpPos.row][jumpPos.col].piece == null) {
              possibleMoves.push(jumpPos);
            }
          } // Single step movement only allowed for initial moves, not during secondary jumps
        } else if (this.activePiecePosition == null) {
          possibleMoves.push(movePosition);
        }
      }
    });
    return possibleMoves;
  }

}
