import { Injectable } from "@angular/core";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Drop } from "../game-models/turn-actions/drop.model";
import { Move } from "../game-models/turn-actions/move.model";
import { Promote } from "../game-models/turn-actions/promote.model";
import { Take } from "../game-models/turn-actions/take.model";
import { Winner } from "../game-models/turn-actions/winner.model";

@Injectable({
  providedIn: 'root'
})
export class JsonToActionService {

  toMove(data): Move {
    return new Move(
      new RowColPosition(data['from']['row'], data['from']['col']),
      new RowColPosition(data['to']['row'], data['to']['col']));
  }

  toTake(data): Take {
    return new Take(
      data['takingColour'],
      data['takenPieceName']);
  }

  toDrop(data): Drop {
    return new Drop(
      new RowColPosition(data['dropPos']['row'], data['dropPos']['col']),
      data['droppingColour'],
      data['droppingPieceName']);
  }

  toPromote(data): Promote {
    return new Promote(
      new RowColPosition(data['promoteLocation']['row'], data['promoteLocation']['col']),
      data['promotionPieceName']);
  }

  toWinner(data): Winner {
    return new Winner(
      data['winnerName']);
  }
}
