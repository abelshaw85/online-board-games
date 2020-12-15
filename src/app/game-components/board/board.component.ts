import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Player } from '../player/player.model';
import { GameService } from '../services/game.service';
import { Square } from '../square/square.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  providers: [GameService]
})
export class BoardComponent implements OnInit, OnDestroy {
  squares: Square[][];
  takenByWhite: Square[] = [];
  takenByBlack: Square[] = [];
  blacksTurn: boolean;
  gameLog: string[] = [];
  takenByBlackSubscription: Subscription;
  takenByWhiteSubscription: Subscription;
  gameLogUpdatedSubscription: Subscription;
  turnChangedSubscription: Subscription;
  gameSubscription: Subscription;
  playersSet: Subscription;
  whitePlayer: Player;
  blackPlayer: Player;


  constructor(private gameService: GameService) {

  }

  ngOnInit(): void {
    this.gameSubscription = this.gameService.gameUpdated.subscribe( //each time this subject emits a new array, change the array
      (squares: Square[][]) => {
        this.squares = squares;
      }
    );

    this.takenByBlackSubscription = this.gameService.takenByBlackUpdated.subscribe(
      (squares: Square[]) => {
        this.takenByBlack = squares;
      }
    );

    this.takenByWhiteSubscription = this.gameService.takenByWhiteUpdated.subscribe(
      (squares: Square[]) => {
        this.takenByWhite = squares;
      }
    );

    this.gameLogUpdatedSubscription = this.gameService.gameLogUpdated.subscribe(
      (gameLog: string[]) => {
        this.gameLog = gameLog.reverse();
      }
    );

    this.turnChangedSubscription = this.gameService.turnChanged.subscribe(
      (blacksTurn: boolean) => {
        this.blacksTurn = blacksTurn;
      }
    );

    this.playersSet = this.gameService.playersSet.subscribe(
      (players) => {
        this.blackPlayer = players.Black,
        this.whitePlayer = players.White
      }
    );
    this.gameService.new(new Player("John"), new Player("Steve"));
    this.squares = this.gameService.getSquares(); //required for initial setup
  }

  ngOnDestroy(): void {
    this.gameSubscription.unsubscribe();
    this.takenByBlackSubscription.unsubscribe();
    this.takenByWhiteSubscription.unsubscribe();
    this.gameLogUpdatedSubscription.unsubscribe();
    this.turnChangedSubscription.unsubscribe();
    this.playersSet.unsubscribe();
  }

}
