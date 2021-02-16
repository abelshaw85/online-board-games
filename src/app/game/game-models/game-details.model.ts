import { Player } from "./player.model";


export class GameDetails {
  constructor(public gameId: number,
    public type: string,
    public status: string,
    public player1: Player,
    public player2: Player) {}
}
