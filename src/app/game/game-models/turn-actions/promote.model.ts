import { IAction } from "./action.interface";
import { RowColPosition } from "../row-col-position.model";

export class Promote implements IAction {
  public type: string = "Promote";

  constructor(
    public promoteLocation: RowColPosition,
    public promotionPieceName: string) {
  }
}
