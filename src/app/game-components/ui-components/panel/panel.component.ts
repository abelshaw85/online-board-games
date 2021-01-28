import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameDetails } from '../../game-models/game-details.model';
import { Player } from '../../game-models/player.model';
import { GameDetailsService } from '../../services/game-details.service';
import { GameManagerService } from '../../services/game-manager.service';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit, OnDestroy {
  playerGames = [];
  subscriptions: Subscription[] = [];
  connected: boolean;
  userGames: GameDetails[] = [];
  singlePlayerSelected: boolean = false;

  constructor(
    private gameManagerService: GameManagerService,
    private gameDetailsService: GameDetailsService) { }

  ngOnInit(): void {
    this.gameDetailsService.getGameDetails().subscribe((response) => {
      let gamesDetails: GameDetails[] = [];
      for (var details of response["data"]) {
        let gameDetails: GameDetails = this.jsonToGameDetails(details);
        gamesDetails.push(gameDetails);
      }
      this.playerGames = gamesDetails;
    });
  }

  private jsonToGameDetails(details): GameDetails {
    return new GameDetails(
      details['gameId'],
      details['type'],
      new Player(details['player1']['username'], details['player1']['colour']),
      new Player(details['player2']['username'], details['player2']['colour']));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  newShogiGame() {
    this.gameManagerService.newGame("Shogi", this.singlePlayerSelected).subscribe((response) => {
      if (response['type'] == "NewGameSuccess") {
        alert("New game created!");
        let gameDetails: GameDetails = this.jsonToGameDetails(response['data']);
        this.playerGames.push(gameDetails);
      } else if (response['type'] == "NewGameFailure") {
        alert(response['message']);
      }
    });
  }

  get isSinglePlayer(): boolean {
    return this.singlePlayerSelected;
  }

  set isSinglePlayer(val: boolean) {
    this.singlePlayerSelected = val;
  }

  gameStatus(gameDetails: GameDetails): string {
    if (gameDetails.player1.name == gameDetails.player2.name) {
      return "Single Player";
    } else if (gameDetails.player1.name == "" || gameDetails.player2.name == "") {
      return "Awaiting Second Player";
    } else {
      return "In Progress";
    }
  }
}
