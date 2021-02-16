import { IAction } from "./action.interface";

export class Turn {
  actions: IAction[] = [];

  constructor(public gameId: number) {
  }

  public addAction(action: IAction) {
    this.actions.push(action);
  }
}
