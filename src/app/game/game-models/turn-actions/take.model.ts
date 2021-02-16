import { IAction } from "./action.interface";

export class Take implements IAction {
  public type: string = "Take";

  constructor(
    public takingColour: string,
    public takenPieceName: string
  ) {}
}
