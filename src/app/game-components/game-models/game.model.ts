import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { GameLogic } from "../game-logic-services/game-logic.class";
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
  public gameLogic: GameLogic;
  public gameLog: string[] = [];
  public gameId: number;
  public type: string;
  public status: string;
  public squares: Square[][];
  public player1: Player;
  public player2: Player;
  public winnerName: string;
  public activeColour: string;
  public takenByWhite: Square[] = [];
  public takenByBlack: Square[] = [];
  public turn: Turn;

  constructor(private http: HttpClient) {}

  getPlayerByColour(colour: string): Player {
    if (this.player1 !== null && this.player1.colour == colour) {
      return this.player1;
    } else if (this.player2 !== null && this.player2.colour == colour) {
      return this.player2;
    }
    return null; //colour does not match either player
  }

  setGameLogic(gameLogic: GameLogic) {
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

  addTurnAction(action: IAction) {
    if (this.turn == null) {
      this.turn = new Turn(this.gameId);
    }
    this.turn.addAction(action);
  }

  takeTurn() {
    for (let action of this.turn.actions) {
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
    this.turn = null;
    this.toggleTurn();
  }

  postTurn() {
    if (this.turn == null) {
      return;
    }
    this.http.post<Turn>(environment.serverUrl + "/makeTurn", this.turn)
      .subscribe((response) => {
        console.log(response);
        this.turn = null;
      }
    );
  }

  toggleTurn() {
    if (this.player1.colour == this.activeColour) {
      this.activeColour = this.player2.colour;
    } else {
      this.activeColour = this.player1.colour;
    }
  }

  isFaceDown(colour: string) {
    return this.gameLogic.isFaceDown(colour);
  }
}
