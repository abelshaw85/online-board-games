import { IAction } from "./action.interface";
import { RowColPosition } from "../row-col-position.model";

export class Move implements IAction {
  public type: string = "Move";

  constructor(public from: RowColPosition, public to: RowColPosition) {
    this.from = from;
    this.to = to;
  }
}
