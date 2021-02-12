import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameDetails } from '../../game-models/game-details.model';
import { Player } from '../../game-models/player.model';
import { AlertService } from '../../../shared/alert.service';
import { GameDetailsService } from '../../services/game-details.service';
import { GameManagerService } from '../../services/game-manager.service';

@Component({
  selector: 'app-join-games',
  templateUrl: './join-games.component.html',
  styleUrls: ['./join-games.component.css']
})
export class JoinGamesComponent implements OnInit {
  joinGames: GameDetails[] = [];
  loadingMessage: string = "Loading...";
  loading: boolean = true;

  constructor(private gameDetailsService: GameDetailsService,
    private gameManager: GameManagerService,
    private router: Router,
    public alertService: AlertService) { }

  ngOnInit(): void {
    this.gameDetailsService.getGamesToJoinDetails().subscribe((response) => {
      let gamesDetails: GameDetails[] = [];
      for (var details of response["data"]) {
        let gameDetails: GameDetails = this.jsonToGameDetails(details);
        gamesDetails.push(gameDetails);
      }
      this.joinGames = gamesDetails;
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

  waitingPlayer(joinGame: GameDetails): string {
    if (joinGame.player1.name !== "") {
      return joinGame.player1.name;
    } else {
      return joinGame.player2.name;
    }
  }

  joinGameById(gameId: number) {
    this.gameManager.joinGameById(gameId).subscribe((response) => {
      this.handleResponse(response, gameId);
    });
  }

  async handleResponse(response, gameId) {
    let responseType = response['type'];
    switch (responseType) {
      case "GameJoinFailure":
        await this.alertService.openAlert("Join Game Error", "Could not join game with id of " + gameId + " : " + response['message']);
        // Remove game from list of games to join
        let index = this.joinGames.findIndex(gameDetails => {
          return gameDetails.gameId == gameId;
        });
        this.joinGames.splice(index, 1);
        break;
      case "GameJoinSuccess":
        await this.alertService.openAlert("Game Joined", "Successfully joined game!");
        this.router.navigate(['games', gameId]);
    }
  }

  // async openAlert(heading: string, text: string) {
  //   const dialogRef = this.dialog.open(CustomAlertDialogue, {
  //     width: '35%',
  //     data: {
  //       heading: heading,
  //       text: text
  //     }
  //   });

  //  await dialogRef.afterClosed().toPromise().then(result => {
  //    //this.promotePiece = result;
  //  });
  // }

}
