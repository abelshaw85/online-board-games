import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";

export interface IGameLogic {
  //Used by Square and Game to check if a move is valid
  isPossibleMove(game: Game, to: RowColPosition);
  //Used by components to show/clear possible moves
  highlightPossibleMoves(game: Game, startingPos:RowColPosition);
  highlightPossibleDrops(game: Game, dropPiece: Piece);
  unhighlightPossibleMoves(game: Game);
  //Used by components to handle moving and dropping
  movePiece(game: Game, from: RowColPosition, to: RowColPosition);
  dropPiece(game: Game, pieceToDrop: Piece, positionToDrop: RowColPosition);
  //Following are used both when getting a Turn from the server, and internally to perform moves and drops.
  makeMove(game: Game, from: RowColPosition, to: RowColPosition);
  makeDrop(game: Game, dropPos: RowColPosition, droppingColour: string, droppingPieceName: string);
  makePromote(game: Game, pieceLocation: RowColPosition, promotionPieceName: string);
  makeTake(game: Game, takingColour: string, takenPieceName: string);
}
