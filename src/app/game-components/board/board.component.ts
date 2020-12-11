import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
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
  takenByBlackSubscription: Subscription;
  takenByWhiteSubscription: Subscription;
  gameLogUpdatedSubscription: Subscription;
  turnChangedSubscription: Subscription;
  gameLog: string[] = [];
  gameSubscription: Subscription;

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
    this.gameService.new();
    this.squares = this.gameService.getSquares();
  }

  ngOnDestroy(): void {
    this.gameSubscription.unsubscribe();
    this.takenByBlackSubscription.unsubscribe();
    this.takenByWhiteSubscription.unsubscribe();
    this.gameLogUpdatedSubscription.unsubscribe();
    this.turnChangedSubscription.unsubscribe();
  }

}
