import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/auth.service';
import { GameDetails } from '../../game-models/game-details.model';
import { Player } from '../../game-models/player.model';
import { AlertService } from '../../../shared/alert.service';
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
  closedGames = [];
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
    private authorisationService: AuthenticationService,
    public alertService: AlertService) { }

  ngOnInit(): void {
    this.loadingMessage = "Fetching game details...";
    this.gameDetailsService.getGameDetails().subscribe((response) => {
      for (var details of response["data"]) {
        let gameDetails: GameDetails = this.jsonToGameDetails(details);
        if (gameDetails.status != "Closed") {
          this.playerGames.push(gameDetails);
        } else {
          this.closedGames.push(gameDetails);
        }
      }
      this.loading = false;
    },
    (error) => {
      this.loading = false;
      this.alertService.openAlert("Fetch game details error", "Unable to fetch game details: " + error.message);
    });
  }

  private jsonToGameDetails(details): GameDetails {
    return new GameDetails(
      details['gameId'],
      details['type'],
      details['status'],
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
          this.handleNewGameResponse(response);

        });
        break;
      case "Chess":
        this.gameManagerService.newGame("Chess", gameData.isSinglePlayer).subscribe((response) => {
          this.handleNewGameResponse(response);
        });
        break;
      case "Draughts":
        this.gameManagerService.newGame("Draughts", gameData.isSinglePlayer).subscribe((response) => {
          this.handleNewGameResponse(response);
        });
        break;
      default:
        console.log(gameData.type + " is unknown type");
        break;
    }
    form.reset();
  }

  gameStatus(gameDetails: GameDetails): string {
    if (gameDetails.status == "Ongoing") {
      if (gameDetails.player1.name == gameDetails.player2.name) {
        return "Ongoing (Single Player)";
      } else {
        let thisPlayerName = this.authorisationService.getLoggedInUserName();
        let opposingPlayerName = gameDetails.player1.name != thisPlayerName ? gameDetails.player1.name : gameDetails.player2.name;
        return "Ongoing VS " + opposingPlayerName;
      }
    } else if (gameDetails.status == "Awaiting") {
      return "Awaiting Second Player";
    } else {
      return "Unknown Status";
    }
  }

  handleNewGameResponse(response) {
    if (response['type'] == "NewGameSuccess") {
      this.gameSuccess(response['data']);
    } else if (response['type'] == "NewGameFailure") {
      this.gameError(response['message']);
    }
  }

  gameSuccess(gameDetailsData) {
    this.alertService.openAlert("Game Created", "New game created!");
    let gameDetails: GameDetails = this.jsonToGameDetails(gameDetailsData);
    this.playerGames.push(gameDetails);
  }

  gameError(errorMessage) {
    this.alertService.openAlert("Game Creation Error", "There was an issue creating your game: " + errorMessage);
  }

  resign(gameId: number) {
    let resigningPlayerName = this.authorisationService.getLoggedInUserName();
    this.alertService.openConfirm(
      "Resign?",
      "You will forfeit the game and your opponent will be declared the winner. Really resign?",
      "Resign",
      "Cancel",
      "50").then((result) => {
        if (result) {
          this.gameManagerService.resign(gameId, resigningPlayerName).subscribe((response) => {
            if (response['type'] == "GameResignSuccess") {
              let gameIndex = this.playerGames.indexOf((gameDetails) => {
                gameDetails.gameId == gameId;
              });
              let removedDetails = this.playerGames.splice(gameIndex, 1);
              for (let detail of removedDetails) {
                this.closedGames.push(detail);
              }
              this.alertService.openAlert("You Resigned", "You have resigned from the game with id of " + gameId);
            }
          });
        }
    });
  }
}
