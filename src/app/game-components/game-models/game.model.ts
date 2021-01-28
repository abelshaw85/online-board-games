import { IGameLogic } from "../game-logic-services/game-logic.interface";
import { Piece } from "./piece.model";
import { Player } from "./player.model";
import { RowColPosition } from "./row-col-position.model";
import { Square } from "./square.model";
import { IAction } from "./turn-actions/action.interface";
import { Drop } from "./turn-actions/drop.model";
import { Move } from "./turn-actions/move.model";
import { Promote } from "./turn-actions/promote.model";
import { Take } from "./turn-actions/take.model";
import { Turn } from "./turn-actions/turn.model";

export class Game {
  private gameLogic: IGameLogic;
  public gameLog: string[] = [];
  public gameId: number;
  public type: string;
  public squares: Square[][];
  public player1: Player;
  public player2: Player;
  public activeColour: string;
  public takenByWhite: Square[] = [];
  public takenByBlack: Square[] = [];

  getPlayerByColour(colour: string): Player {
    if (this.player1 !== null && this.player1.colour == colour) {
      return this.player1;
    } else if (this.player2 !== null && this.player2.colour == colour) {
      return this.player2;
    }
    return null; //colour does not match either player
  }

  setGameLogic(gameLogic: IGameLogic) {
    this.gameLogic = gameLogic;
  }

  getBoardSize(): number {
    return this.squares.length;
  }

  highlightPossibleMoves(startingPos: RowColPosition) {
    this.gameLogic.highlightPossibleMoves(this, startingPos);
  }

  highlightDrops(piece: Piece) {
    this.gameLogic.highlightPossibleDrops(this, piece);
  }

  unhighlightPossibleMoves() {
    this.gameLogic.unhighlightPossibleMoves(this);
  }

  //Used internally to make a move
  movePiece(from: RowColPosition, to: RowColPosition) {
    this.gameLogic.movePiece(this, from, to);
  }

  //Used when receive a server response of type Turn
  makeMove(from: RowColPosition, to: RowColPosition) {
    this.gameLogic.makeMove(this, from, to);
  }

  makeDrop(dropPos: RowColPosition, droppingColour: string, droppingPieceName: string) {
    this.gameLogic.makeDrop(this, dropPos, droppingColour, droppingPieceName);
  }

  makePromote(pieceLocation: RowColPosition, promotionPieceName: string) {
    this.gameLogic.makePromote(this, pieceLocation, promotionPieceName);
  }

  makeTake(takingColour: string, takenPieceName: string) {
    this.gameLogic.makeTake(this, takingColour, takenPieceName);
  }

  isPossibleMove(to: RowColPosition): boolean {
    return this.gameLogic.isPossibleMove(this, to);
  }

  dropPiece(movingPiece, to) {
    this.gameLogic.dropPiece(this, movingPiece, to);
  }

  takeTurn(turn: Turn) {
    for (let action of turn.actions) {
      switch(action.type) {
        case "Move":
          let move: Move = <Move>action;
          this.makeMove(move.from, move.to);
          break;
        case "Take":
          let take: Take = <Take>action;
          this.makeTake(take.takingColour, take.takenPieceName);
          break;
        case "Drop":
          let drop: Drop = <Drop>action;
          this.makeDrop(drop.dropPos, drop.droppingColour, drop.droppingPieceName);
          break;
        case "Promote":
          let promote: Promote = <Promote>action;
          this.makePromote(promote.promoteLocation, promote.promotionPieceName);
          break;
        default:
          console.log("Unknown move type");
          break;
      }
    }
  }

  toggleTurn() {
    if (this.player1.colour == this.activeColour) {
      this.activeColour = this.player2.colour;
    } else {
      this.activeColour = this.player1.colour;
    }
  }
}
