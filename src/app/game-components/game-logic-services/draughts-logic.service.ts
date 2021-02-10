import { HttpClient } from "@angular/common/http";
import { calcPossibleSecurityContexts } from "@angular/compiler/src/template_parser/binding_parser";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Square } from "../game-models/square.model";
import { PieceBag } from "../services/piece-bag.service";
import { GameLogic } from "./game-logic.class";

@Injectable({
  providedIn: 'root'
})
export class DraughtsLogicService extends GameLogic {

  constructor(protected http: HttpClient, protected pieceBag: PieceBag, protected dialog: MatDialog) {
    super(pieceBag, http, dialog);
  }

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
      this.makeMove(game, from, to);
      //If this is a jump move, take the piece between the jump positions
      if (Math.abs(from.row - to.row) > 1) {
        let betweenPos = this.getPositionBetween(from, to);
        let takenSquare = game.squares[betweenPos.row][betweenPos.col];
        console.log(takenSquare);
        this.makeTake(game, game.activeColour, takenSquare.piece.name);
        takenSquare.piece = null;
      }
      let piece = game.squares[to.row][to.col].piece;
      if ((piece.colour == "White" && to.row == (game.getBoardSize() - 1)) || (piece.colour == "Black" && to.row == 0)) {
        this.makePromote(game, to, piece.promotionPiece);
      }
      game.toggleTurn();
    }
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
          }
        } else {
          possibleMoves.push(movePosition);
        }
      }
    });
    return possibleMoves;
  }

}
