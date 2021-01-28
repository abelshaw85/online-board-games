import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy, OnInit } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { AuthenticationService } from "src/app/auth/auth.service";
import { WebSocketService } from "src/app/web-socket/web-socket.service";
import { environment } from "src/environments/environment";
import { ShogiLogicService } from "../game-logic-services/shogi-logic.service";
import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { Player } from "../game-models/player.model";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Square } from "../game-models/square.model";
import { Drop } from "../game-models/turn-actions/drop.model";
import { Move } from "../game-models/turn-actions/move.model";
import { Promote } from "../game-models/turn-actions/promote.model";
import { Take } from "../game-models/turn-actions/take.model";
import { Turn } from "../game-models/turn-actions/turn.model";
import { JsonToActionService } from "./json-action.service";
import { PieceBag } from "./piece-bag.service";

@Injectable({
  providedIn: 'root'
})
export class GameManagerService implements OnInit, OnDestroy {
  loadedGames: Game[] = [];
  subscriptions: Subscription[] = [];
  gameReadyWithId = new Subject<number>(); //emits the id of a game once it has fetched it

  constructor(
              private http: HttpClient,
              private pieceBag: PieceBag,
              private shogiLogic: ShogiLogicService,
              private jsonToAction: JsonToActionService,
              private webSocketService: WebSocketService,
              private authenticationService: AuthenticationService) {
    this.subscriptions.push(this.webSocketService.turnReceived.subscribe((turnData) => {
      this.manageTurn(turnData);
    }));
  }

  ngOnInit(): void {
    //only works on components/directives, not on services
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    })
  }

  newGame(type: string, singlePlayer: boolean) {
    return this.http.post(environment.serverUrl + "/newGame", {
      type: type,
      singlePlayer: singlePlayer
    });
  }

  //tells the service to either fetch the game or confirm the game is already loaded
  requestGame(id) {
    let index: number = this.getIndexOfGame(id);
    if (index < 0) {
      //if the game is not yet loaded, load it
      this.fetchGame(id);
    } else {
      //if the game is already loaded, inform other classes that it is ready to be fetched
      this.gameReadyWithId.next(id);
    }
  }

  //should only be called if the game is loaded
  getGame(id): Game {
    let index: number = this.getIndexOfGame(id);
    if (index < 0) {
      console.log("Error: Game is not yet loaded. Try subscribing to fetchGame().");
      return null;
    }
    return this.loadedGames[index];
  }

  //fetch game from db
  private fetchGame(id) {
    this.http.get(environment.serverUrl + "/getGame/" + id).subscribe((data) => {
      let responseType = data['type'];
      if (responseType === 'FetchGameError') {
        return;
      }
      let gameSquaresData = data['data']['s'];
      let squares: Square[][] = [];
      for (let row = 0; row < gameSquaresData.length; row++) {
        let squareRow: Square[] = [];
        for (let col = 0; col < gameSquaresData[row].length; col++) {
          let pData = gameSquaresData[row][col]['p'];
          let piece: Piece = null;
          if (pData !== null) {
            let pieceName = pData['n'];
            let pieceColour = pData['c'];
            piece = this.pieceBag.getPieceByName(pieceName, pieceColour == "White");
            piece.colour = pieceColour;
          }
          squareRow.push(new Square(piece, new RowColPosition(row, col)));
        }
        squares.push(squareRow);
      }
      let player1: Player = new Player(data['data']['p1']['username'], data['data']['p1']['colour']);
      let player2: Player = new Player(data['data']['p2']['username'], data['data']['p2']['colour']);
      let activeColour: string = data['data']['ac'];
      let type: string = data['data']['t'];
      let game = new Game();
      game.gameId = id;
      game.type = type;
      game.squares = squares;
      game.player1 = player1;
      game.player2 = player2;
      game.activeColour = activeColour;
      for (let takenPiece of data['data']['tp']) {
        let pieceName = takenPiece['n'];
        let pieceColour = takenPiece['c'];
        let piece: Piece = this.pieceBag.getPieceByName(pieceName, pieceColour == "White"); //if white, face down
        piece.colour = pieceColour;
        piece.taken = true;
        let square: Square = new Square(piece);
        if (pieceColour == "White") {
          game.takenByWhite.push(square);
        } else {
          game.takenByBlack.push(square);
        }
      }
      //inject shogi logic into game:
      game.setGameLogic(this.shogiLogic);
      let index: number = this.getIndexOfGame(id);
      // If game does not exist in loadedGames, push it to the loadedGames array. Otherwise, replace the game.
      if (index < 0) {
        this.loadedGames.push(game);
      } else {
        this.loadedGames[index] = game;
      }
      console.log("Game successfully fetched.");
      this.gameReadyWithId.next(id);
    });
  }

  getTurnColour(gameId): string {
    return this.loadedGames[this.getIndexOfGame(gameId)].activeColour;
  }

  getPlayerByColour(gameId, colour: string): Player {
    return this.loadedGames[this.getIndexOfGame(gameId)].getPlayerByColour(colour);
  }

  joinGameById(gameId) {
    return this.http.get(environment.serverUrl + "/joinGame/" + gameId);
  }

  private getIndexOfGame(gameId): number {
    let index: number = this.loadedGames.findIndex((game) => {
      return game.gameId == +gameId;
    });
    return index;
  }

  private manageTurn(turnData) {
    let gameId = turnData['gameId'];
    let player: string = turnData['player'];
    let gameIndex = this.getIndexOfGame(gameId);
    //ignore turn if logged in player made the turn or if the game is not loaded.
    if (player != this.authenticationService.getLoggedInUserName() && gameIndex != -1) {
      let turn: Turn = new Turn(gameId);
      const actions: any[] = turnData['actions'];
      for (let action of actions) {
        let actionType = action['type'];
        switch(actionType) {
          case "Move":
            let move: Move = this.jsonToAction.toMove(action);
            turn.addAction(move);
            break;
          case "Take":
            let take: Take = this.jsonToAction.toTake(action);
            turn.addAction(take);
            break;
          case "Drop":
            let drop: Drop = this.jsonToAction.toDrop(action);
            turn.addAction(drop);
            break;
          case "Promote":
            let promote: Promote = this.jsonToAction.toPromote(action);
            turn.addAction(promote);
            break;
          default:
            console.log("Unknown move type");
            break;
        }
      }
      this.loadedGames[gameIndex].takeTurn(turn);
    }
  }
}
