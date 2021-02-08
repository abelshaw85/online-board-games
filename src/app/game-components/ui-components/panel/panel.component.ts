import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/auth.service';
import { GameDetails } from '../../game-models/game-details.model';
import { Player } from '../../game-models/player.model';
import { GameDetailsService } from '../../services/game-details.service';
import { GameManagerService } from '../../services/game-manager.service';

interface GameType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PanelComponent implements OnInit, OnDestroy {
  playerGames = [];
  subscriptions: Subscription[] = [];
  connected: boolean;
  loadingMessage: string = "Loading...";
  loading: boolean = true;
  gameTypes: GameType[] = [
    {value: 'Shogi', viewValue: 'Shogi'},
    {value: 'Chess', viewValue: 'Chess'},
    {value: 'Draughts', viewValue: 'Draughts'}
  ];

  constructor(
    private gameManagerService: GameManagerService,
    private gameDetailsService: GameDetailsService,
    private authorisationService: AuthenticationService) { }

  ngOnInit(): void {
    this.loadingMessage = "Fetching game details...";
    this.gameDetailsService.getGameDetails().subscribe((response) => {
      let gamesDetails: GameDetails[] = [];
      for (var details of response["data"]) {
        let gameDetails: GameDetails = this.jsonToGameDetails(details);
        gamesDetails.push(gameDetails);
      }
      this.playerGames = gamesDetails;
      this.loading = false;
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

  submitGameCreate(form: NgForm) {
    // Retrieve form data and bind to gameData object
    let gameData = {
      type: form.value.type,
      isSinglePlayer: form.value.isSinglePlayer
    };

    switch (gameData.type) {
      case "Shogi":
        this.gameManagerService.newGame("Shogi", gameData.isSinglePlayer).subscribe((response) => {
          if (response['type'] == "NewGameSuccess") {
            alert("New game created!");
            let gameDetails: GameDetails = this.jsonToGameDetails(response['data']);
            this.playerGames.push(gameDetails);
          } else if (response['type'] == "NewGameFailure") {
            alert(response['message']);
          }
        });
        break;
      case "Chess":
        this.gameManagerService.newGame("Chess", gameData.isSinglePlayer).subscribe((response) => {
          if (response['type'] == "NewGameSuccess") {
            alert("New game created!");
            let gameDetails: GameDetails = this.jsonToGameDetails(response['data']);
            this.playerGames.push(gameDetails);
          } else if (response['type'] == "NewGameFailure") {
            alert(response['message']);
          }
        });
        break;
      case "Draughts":
        alert("No draughts yet");
        break;
      default:
        alert(gameData.type + " is unknown type");
        break;
    }
    form.reset();
  }

  gameStatus(gameDetails: GameDetails): string {
    if (gameDetails.player1.name == gameDetails.player2.name) {
      return "Single Player";
    } else if (gameDetails.player1.name == "" || gameDetails.player2.name == "") {
      return "Awaiting Second Player";
    } else {
      let thisPlayerName = this.authorisationService.getLoggedInUserName();
      let opposingPlayerName = gameDetails.player1.name != thisPlayerName ? gameDetails.player1.name : gameDetails.player2.name;
      return "In Progress Against " + opposingPlayerName;
    }
  }
}
