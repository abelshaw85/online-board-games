
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebSocketService } from 'src/app/web-socket/web-socket.service';
import { Game } from '../game-models/game.model';
import { GameManagerService } from '../services/game-manager.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, OnDestroy {
  game: Game;
  id: number;
  subscriptions: Subscription[] = [];

  connected: boolean;

  constructor(
    private webSocketService: WebSocketService,
    private route: ActivatedRoute,
    private gameManager: GameManagerService) {
  }

  test() {
    this.webSocketService.test();
  }

  ngOnInit(): void {
    this.game = new Game();
    this.id = +this.route.snapshot.params["id"];
    this.subscriptions.push(this.gameManager.gameReadyWithId.subscribe(
      (gameId) => {
        if (gameId == this.id) {
          this.game = this.gameManager.getGame(this.id);
          this.connected = true;
        }
      }
    ));

    //if route changes, change id and request the game with the new id
    this.subscriptions.push(this.route.params.subscribe(routeParams => {
      this.id = routeParams.id;
      this.gameManager.requestGame(this.id);
    }));
  }

  connect() {
    this.webSocketService._connect();
  }

  disconnect() {
    this.webSocketService._disconnect();
  }

  sendMove() {
    this.webSocketService._sendMove();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
