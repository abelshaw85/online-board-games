import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/auth.service';
import { CustomAlertDialogue } from 'src/app/shared/custom-alert/custom-alert.component';
import { GameDetails } from '../../game-models/game-details.model';
import { Player } from '../../game-models/player.model';
import { AlertService } from '../../services/alert.service';
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
    private authorisationService: AuthenticationService,
    public alertService: AlertService) { }

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

  // openAlert(heading: string, text: string) {
  //   const dialogRef = this.dialog.open(CustomAlertDialogue, {
  //     width: '35%',
  //     data: {
  //       heading: heading,
  //       text: text
  //     }
  //   });
  // }
}
