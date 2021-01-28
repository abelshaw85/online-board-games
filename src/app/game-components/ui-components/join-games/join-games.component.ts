import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameDetails } from '../../game-models/game-details.model';
import { Player } from '../../game-models/player.model';
import { GameDetailsService } from '../../services/game-details.service';
import { GameManagerService } from '../../services/game-manager.service';

@Component({
  selector: 'app-join-games',
  templateUrl: './join-games.component.html',
  styleUrls: ['./join-games.component.css']
})
export class JoinGamesComponent implements OnInit {
  joinGames: GameDetails[] = [];

  constructor(private gameDetailsService: GameDetailsService,
    private gameManager: GameManagerService,
    private router: Router) { }

  ngOnInit(): void {
    this.gameDetailsService.getGamesToJoinDetails().subscribe((response) => {
      let gamesDetails: GameDetails[] = [];
      for (var details of response["data"]) {
        let gameDetails: GameDetails = this.jsonToGameDetails(details);
        gamesDetails.push(gameDetails);
      }
      this.joinGames = gamesDetails;
    });
  }

  private jsonToGameDetails(details): GameDetails {
    return new GameDetails(
      details['gameId'],
      details['type'],
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
      let responseType = response['type'];
      switch (responseType) {
        case "GameJoinFailure":
          alert(response['message']);
          let index = this.joinGames.findIndex(gameDetails => {
            return gameDetails.gameId == gameId;
          });
          this.joinGames.splice(index, 1);
          break;
        case "GameJoinSuccess":
          alert("Successfully joined game!");
          this.router.navigate(['games', gameId]);
      }
    });
  }

}
