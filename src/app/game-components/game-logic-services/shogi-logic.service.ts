import { Injectable } from "@angular/core";
import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Move } from "../game-models/turn-actions/move.model";
import { Take } from "../game-models/turn-actions/take.model";
import { Promote } from "../game-models/turn-actions/promote.model";
import { Drop } from "../game-models/turn-actions/drop.model";
import { Winner } from "../game-models/turn-actions/winner.model";
import { ChessLikeLogic } from "./chess-like-logic.class";
import { ShogiPromoteConfirmDialog } from "./dialogs/shogi-promote-confirm.component";
import { MatDialog } from "@angular/material/dialog";

/*
  Concrete class that implements Shogi-specific logic. Uses ChessLike as a template for logic that is true across Shogi, Chess, and other chess-like games
*/
@Injectable({
  providedIn: 'root'
})
export class ShogiLogicService extends ChessLikeLogic {
  private promotePiece: boolean;

  constructor(private dialog: MatDialog) {
    super();
    this.kingPieces.push("SHO-Jeweled General");
    this.kingPieces.push("SHO-King General");
  }

  async movePiece(game: Game, from: RowColPosition, to: RowColPosition) {
    let startedInCheck = this.isPlayerInCheck(game, game.activeColour); //used to customise losing message if active player doesnt get themselves out of check

    // If square has a piece to take, add it to player's hand
    if (game.squares[to.row][to.col].piece != null) {
      let capturedPiece: Piece = game.squares[to.row][to.col].piece;

      //Captured pieces must unpromote
      if (capturedPiece.promoted) {
        let unpromotedPieceName = this.pieceBag.unpromotePiece(capturedPiece.name).name;
        this.makePromote(game, to, unpromotedPieceName); //swaps piece for the unpromoted piece
        capturedPiece = game.squares[to.row][to.col].piece; //piece at this location will now be unpromoted piece
      }
      this.makeTake(game, game.activeColour, capturedPiece.name); //adds piece to the capturing player's hand

      // Add Take to the list of actions
      let takeAction: Take = new Take(game.activeColour, capturedPiece.name);
      game.addTurnAction(takeAction);
    }

    this.makeMove(game, from, to); //replaces piece at "to" with piece from "from"
    //Add move to list of actions
    let moveAction: Move = new Move(from, to);
    game.addTurnAction(moveAction);

    // replace piece with promoted piece if applicable
    let pieceToCheckForPromotion: Piece = game.squares[to.row][to.col].piece;
    if (this.canPromote(game.getBoardSize(), to.row, pieceToCheckForPromotion)) {
      let enforcedPromote = this.isEnforcedPromote(game.getBoardSize(), to.row, pieceToCheckForPromotion);
      if (!enforcedPromote) {
        await this.openConfirmPromote(pieceToCheckForPromotion);
      }
      if (enforcedPromote || this.promotePiece) { //If the piece is forced to promote, or if the user has chosen to promote an optional promotion piece
        this.makePromote(game, to, pieceToCheckForPromotion.promotionPiece); //swaps piece for the promoted piece
        pieceToCheckForPromotion = game.squares[to.row][to.col].piece; //get updated piece
        // Add Promotion to the list of actions
        let promoteAction: Promote = new Promote(to, pieceToCheckForPromotion.name);
        game.addTurnAction(promoteAction);
      }
    }

    // Following checks if active player has accidentally checked themselves, which results in their loss
    let activeColour = game.activeColour;
    let inactiveColour = game.player1.colour == activeColour ? game.player2.colour : game.player1.colour;
    if (this.checkForCheck(game, activeColour)) {
      if (startedInCheck) {
        this.alertService.openAlert("You lose.", "You failed to get yourself out of check! You have lost the game.");
      }
      else {
        this.alertService.openAlert("You lose.", "You put yourself in check! You have lost the game.");
      }
      //Get the INACTIVE player and make them the winner
      let winningPlayerName = game.player1.colour == inactiveColour ? game.player1.name : game.player2.name;
      this.makeWinner(game, winningPlayerName);
      let winnerAction: Winner = new Winner(winningPlayerName);
      game.addTurnAction(winnerAction);
    }
    // Check if active player has caused checkmate to opposing player
    this.victoryStateCheck(game, inactiveColour);

    this.unhighlightPossibleMoves(game);

    game.toggleTurn();

    //Send full turn to the server
    game.postTurn();
  }

  highlightPossibleDrops(game: Game, dropPiece: Piece) {
    let copy = Object.assign({}, dropPiece);
    let pawnCounts = new Array(game.squares.length).fill(0);
    // pawns cannot drop in columns where 2 pawns of the same colour already exist
    if (dropPiece.name == "SHO-Pawn") {
      for (let row = 0; row < game.squares.length; row++) {
        for (let col = 0; col < game.squares[row].length; col++) {
          if (game.squares[row][col].piece != null && game.squares[row][col].piece.name == "SHO-Pawn" && game.squares[row][col].piece.colour == dropPiece.colour) {
            pawnCounts[col] += 1;
          }
        }
      }
    }
    let isOmnidirectional: boolean = (dropPiece.moves.find((move) => move.row > 0) != undefined && dropPiece.moves.find((move) => move.row < 0) != undefined);
    for (let row = 0; row < game.squares.length; row++) {
      for (let col = 0; col < game.squares[row].length; col++) {
        if (game.squares[row][col].piece == null && pawnCounts[col] < 2) {
          if (!isOmnidirectional) {
            game.squares[row][col].piece = copy;
            if (this.getPossibleMoves(game, game.squares[row][col]).length > 0) {// if a piece can only move forwards, it must have a valid move after being dropped.
              game.squares[row][col].active = true;
            }
            game.squares[row][col].piece = null;
          } else {
            game.squares[row][col].active = true;
          }
        }
      }
    }
  }

  dropPiece(game: Game, pieceToDrop: Piece, positionToDrop: RowColPosition) {
    if (this.isInHand(game, pieceToDrop) && game.squares[positionToDrop.row][positionToDrop.col].piece == null) {
      this.makeDrop(game, positionToDrop, pieceToDrop.colour, pieceToDrop.name); //drops piece and removes from player's hand
      // Check if active player has caused checkmate to opposing player
      let inactiveColour = game.player1.colour == game.activeColour ? game.player2.colour : game.player1.colour;
      this.victoryStateCheck(game, inactiveColour);
      game.toggleTurn();

      let dropAction: Drop = new Drop(positionToDrop, pieceToDrop.colour, pieceToDrop.name);
      game.addTurnAction(dropAction);
      //send drop turn to server
      game.postTurn();
    }
    this.unhighlightPossibleMoves(game);
  }

  private canPromote(boardSize: number, row: number, piece: Piece): boolean {
    if (piece.promotionPiece != null) {
      // if a white piece is in the bottom 3 rows
      if (piece.colour == "White" && row >= boardSize - 3) {
        return true;
      // if a black piece is in the top 3 rows
      } else if (piece.colour == "Black" && row <= 2) {
        return true;
      }
    }
    return false;
  }

  private isEnforcedPromote(boardSize: number, row: number, piece: Piece): boolean {
    if (piece.enforcedPromotionRow >= 0) {
      if (piece.colour == "White" && row >= (boardSize - 1 - piece.enforcedPromotionRow)) {
        return true;
      } else if (piece.colour == "Black" && row <= (0 + piece.enforcedPromotionRow)) {
        return true;
      }
    }
  }

  isFaceDown(colour: string) {
    return colour == "White";
  }

  isActivePiece(game: Game, piece: Piece, position: RowColPosition): boolean {
    return piece != null &&
      piece.colour == game.activeColour;
  }

  async openConfirmPromote(piece: Piece) {
    const dialogRef = this.dialog.open(ShogiPromoteConfirmDialog, {
      width: '50%',
      disableClose: true,
      data: {
        piece: piece
      }
    });

   await dialogRef.afterClosed().toPromise().then(result => {
     this.promotePiece = result;
   });
  }
}
