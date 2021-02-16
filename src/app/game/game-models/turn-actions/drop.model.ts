import { RowColPosition } from "../row-col-position.model";
import { IAction } from "./action.interface";

export class Drop implements IAction {
  public type: string = "Drop";

  constructor(
    public dropPos: RowColPosition,
    public droppingColour: string,
    public droppingPieceName: string) {
  }
}
