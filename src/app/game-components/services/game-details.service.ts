import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { GameDetails } from "../game-models/game-details.model";

@Injectable({
  providedIn: 'root'
})
export class GameDetailsService {

  constructor(private http: HttpClient) {
  }

  getGameDetails() {
    return this.http.get(environment.serverUrl + "/gameDetails");
  }

  getGamesToJoinDetails() {
    return this.http.get(environment.serverUrl + "/gamesToJoin");
  }
}
