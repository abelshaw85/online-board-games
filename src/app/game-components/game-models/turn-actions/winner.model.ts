import { IAction } from "./action.interface";

export class Winner implements IAction {
  public type: string = "Winner";

  constructor(public winnerName: string) {}
}
