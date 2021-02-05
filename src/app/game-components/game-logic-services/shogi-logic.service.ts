import { Injectable } from "@angular/core";
import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Square } from "../game-models/square.model";
import { GameLogic } from "./game-logic.class";
import { Turn } from "../game-models/turn-actions/turn.model";
import { Move } from "../game-models/turn-actions/move.model";
import { Take } from "../game-models/turn-actions/take.model";
import { Promote } from "../game-models/turn-actions/promote.model";
import { HttpClient } from "@angular/common/http";
import { Drop } from "../game-models/turn-actions/drop.model";
import { PieceBag } from "../services/piece-bag.service";
import { Winner } from "../game-models/turn-actions/winner.model";

@Injectable({
  providedIn: 'root'
})
export class ShogiLogicService extends GameLogic {
  player1InCheck = false;
  player2InCheck = false;

  constructor(protected http: HttpClient, protected pieceBag: PieceBag) {
    super(pieceBag, http);
  }

  movePiece(game: Game, from: RowColPosition, to: RowColPosition) {
    let turn: Turn = new Turn(game.gameId); // Create new Turn object that will be populated by Actions.
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
      turn.addAction(takeAction);
    }

    this.makeMove(game, from, to); //replaces piece at "to" with piece from "from"
    //Add move to list of actions
    let moveAction: Move = new Move(from, to);
    turn.addAction(moveAction);

    // replace piece with promoted piece if applicable
    let pieceToCheckForPromotion: Piece = game.squares[to.row][to.col].piece;
    if (this.canPromote(game.getBoardSize(), to.row, pieceToCheckForPromotion)) {
      if (this.isEnforcedPromote(game.getBoardSize(), to.row, pieceToCheckForPromotion) ||
          confirm("This piece can be promoted to " + pieceToCheckForPromotion.promotionPiece + ", would you like to promote this piece?")) {
        this.makePromote(game, to, pieceToCheckForPromotion.promotionPiece); //swaps piece for the promoted piece
        pieceToCheckForPromotion = game.squares[to.row][to.col].piece; //get updated piece
        // Add Promotion to the list of actions
        let promoteAction: Promote = new Promote(to, pieceToCheckForPromotion.name);
        turn.addAction(promoteAction);
      }
    }

    // Following checks if active player has accidentally checked themselves, which results in their loss
    let activeColour = game.activeColour;
    let inactiveColour = game.player1.colour == activeColour ? game.player2.colour : game.player1.colour;
    if (this.checkForCheck(game, activeColour)) {
      if (startedInCheck) {
        alert("You failed to get yourself out of check! You have lost the game.");
      }
      else {
        alert("You put yourself in check! You have lost the game.");
      }
      //Get the INACTIVE player and make them the winner
      let winningPlayerName = game.player1.colour == inactiveColour ? game.player1.name : game.player2.name;
      this.makeWinner(game, winningPlayerName);
      let winnerAction: Winner = new Winner(winningPlayerName);
      turn.addAction(winnerAction);
    }
    // Check if active player has caused checkmate to opposing player
    this.victoryStateCheck(game, turn, inactiveColour);

    this.unhighlightPossibleMoves(game);
    game.toggleTurn();

    //Send full turn to the server
    this.postTurn(turn).subscribe((response) => {
      console.log(response);
    });
  }

  // If checkmate, need to add Winner action to turn
  victoryStateCheck(game: Game, turn: Turn, inactiveColour: string) {
    if (this.checkForCheck(game, inactiveColour)) {
      if (this.checkForCheckMate(game, inactiveColour)) {
        alert("Checkmate! You have won!");
        let winningPlayerName = game.player1.colour == game.activeColour ? game.player1.name : game.player2.name;
        this.makeWinner(game, winningPlayerName);
        let winnerAction: Winner = new Winner(winningPlayerName);
        turn.addAction(winnerAction);
      }
    }
  }

  highlightPossibleMoves(game: Game, startingPos: RowColPosition) {
    // set current square
    let currentSquare = game.squares[startingPos.row][startingPos.col];
    currentSquare.current = true;

    this.getPossibleMoves(game, currentSquare).forEach(move => {
      let squareToMoveTo: Square = game.squares[move.row][move.col];
      if (squareToMoveTo.piece == null) {
        squareToMoveTo.active = true;
      } else if (squareToMoveTo.piece.colour != currentSquare.piece.colour) {
        squareToMoveTo.danger = true;
      }
    });
  }

  highlightPossibleDrops(game: Game, dropPiece: Piece) {
    let copy = Object.assign({}, dropPiece);
    let pawnCounts = new Array(game.squares.length).fill(0);
    // pawns cannot drop in columns where 2 pawns of the same colour already exist
    if (dropPiece.name == "Pawn") {
      for (let row = 0; row < game.squares.length; row++) {
        for (let col = 0; col < game.squares[row].length; col++) {
          if (game.squares[row][col].piece != null && game.squares[row][col].piece.name == "Pawn" && game.squares[row][col].piece.colour == dropPiece.colour) {
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
    let turn: Turn = new Turn(game.gameId);
    if (this.isInHand(game, pieceToDrop) && game.squares[positionToDrop.row][positionToDrop.col].piece == null) {
      this.makeDrop(game, positionToDrop, pieceToDrop.colour, pieceToDrop.name); //drops piece and removes from player's hand
      // Check if active player has caused checkmate to opposing player
      let inactiveColour = game.player1.colour == game.activeColour ? game.player2.colour : game.player1.colour;
      this.victoryStateCheck(game, turn, inactiveColour);
      game.toggleTurn();

      let dropAction: Drop = new Drop(positionToDrop, pieceToDrop.colour, pieceToDrop.name);
      turn.addAction(dropAction);
      //send drop turn to server
      this.postTurn(turn).subscribe((response) => {
        console.log(response);
      });
    }
  }

  private isInHand(game: Game, piece: Piece) {
    if (piece.colour == "White") {
      return game.takenByWhite.find((square) => square.piece.name == piece.name) != undefined;
    } else {
      return game.takenByBlack.find((square) => square.piece.name == piece.name) != undefined;
    }
  }

  private getPossibleMoves(game: Game, square: Square): RowColPosition[] {
    let possibleMoves: RowColPosition[] = [];
    let position: RowColPosition = square.position;
    square.piece.moves.forEach((move) => {
      let moveRow = move.row;
      let moveCol = move.col;
      while (true) {
        if (this.isWithinBoard(game.getBoardSize(), position.row + moveRow, position.col + moveCol)) {
          let squareToMoveTo: Square = game.squares[position.row + moveRow][position.col + moveCol];
          if (squareToMoveTo.piece != null && square.piece.colour == squareToMoveTo.piece.colour) {
            // if square has a piece from the same player, cannot move to this square
            return;
          }
          possibleMoves.push(new RowColPosition(position.row + moveRow, position.col + moveCol));
          if (squareToMoveTo.piece == null && square.piece.extended) { //can only continue moving in this direction if the current square is empty
            if (moveRow < 0) {
              moveRow -= 1;
            }
            if (moveRow > 0) {
              moveRow += 1;
            }
            if (moveCol < 0) {
              moveCol -= 1;
            }
            if (moveCol > 0) {
              moveCol += 1;
            }
          } else {
            return; //acts like continue
          }
        } else {
          return;
        }
      }
    });
    return possibleMoves;
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

  private findKing(game: Game, colour: string): Square {
    let kingSquare = null;

    for (let row = 0; row < game.getBoardSize(); row++) {
      for (let col = 0; col < game.getBoardSize(); col++) {
        let kingSquareCandidate = game.squares[row][col];
        let kingPiece = kingSquareCandidate.piece;
        if (kingPiece != null && kingPiece.colour == colour && (kingPiece.name == "King General" || kingPiece.name == "Jeweled General")) {
          kingSquare = kingSquareCandidate;
        }
      }
    }
    return kingSquare;
  }

  //checks if player is in check, and sets the piece as "in check" if true
  private checkForCheck(game: Game, colour: string): boolean {
    //find the king's square so we can track it
    let kingSquare = this.findKing(game, colour);
    this.unhighlightCheck(game); // Remove check from king, will be re-applied if piece is actually in check

    //highlight squares for every enemy piece
    this.unhighlightPossibleMoves(game);
    for (let row = 0; row < game.getBoardSize(); row++) {
      for (let col = 0; col < game.getBoardSize(); col++) {
        let square = game.squares[row][col];
        let piece = square.piece;
        //if we found a piece that is enemy to this player
        if (piece != null && piece.colour != colour) {
          this.highlightPossibleMoves(game, square.position);
        }
      }
    }
    if (kingSquare.danger) {
      kingSquare.inCheck = true;
    }
    return kingSquare.danger;
  }

  private checkForCheckMate(game: Game, colour: string): boolean {
    // Iterate over pieces
    for (let row = 0; row < game.getBoardSize(); row++) {
      for (let col = 0; col < game.getBoardSize(); col++) {
        let fromSquare = game.squares[row][col];
        // Found friendly piece, see if moving it would undo check
        if (fromSquare.piece != null && fromSquare.piece.colour == colour) {
          let moves = this.getPossibleMoves(game, fromSquare);
          for (let move of moves) {
            // Make copy of the squares
            let fromSquarePiece = Object.assign({}, fromSquare.piece);
            let toSquarePiece = Object.assign({}, game.squares[move.row][move.col].piece);

            game.squares[move.row][move.col].piece = Object.assign({}, fromSquarePiece);
            game.squares[fromSquare.position.row][fromSquare.position.col].piece = null;

            let stillInCheck: boolean = this.checkForCheck(game, colour);
            // Set board back to previous state
            game.squares[fromSquare.position.row][fromSquare.position.col].piece = Object.assign({}, fromSquarePiece);

            // Will typically assign an empty object instead of null, so need to manually set null if object has no properties
            game.squares[move.row][move.col].piece = Object.keys(toSquarePiece).length > 0 ?
              game.squares[move.row][move.col].piece = Object.assign({}, toSquarePiece) :
              game.squares[move.row][move.col].piece = null;

            if (!stillInCheck) {
              this.checkForCheck(game, colour); //re-applies check to checked piece
              return false; //if no longer check, then there is a move to escape check
            }
          }
        }
      }
    }
    return true; // If it gets here, no future piece movement was able to undo check and is therefore checkmate
  }

  private unhighlightCheck(game: Game) {
    let boardSize = game.getBoardSize();
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        game.squares[i][j].inCheck = false;
      }
    }
  }

  private isPlayerInCheck(game: Game, colour: string): boolean {
    for (let row of game.squares) {
      for (let square of row) {
        if (square.piece != null && square.piece.colour == colour && (square.piece.name == "King General" || square.piece.name == "Jeweled General")) {
          return square.inCheck;
        }
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
}
