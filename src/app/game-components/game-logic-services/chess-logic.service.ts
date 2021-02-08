import { Injectable } from "@angular/core";
import { Game } from "../game-models/game.model";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";
import { Square } from "../game-models/square.model";
import { HttpClient } from "@angular/common/http";
import { PieceBag } from "../services/piece-bag.service";
import { ChessLikeLogic } from "./chess-like-logic.class";
import { Turn } from "../game-models/turn-actions/turn.model";
import { Move } from "../game-models/turn-actions/move.model";
import { Take } from "../game-models/turn-actions/take.model";
import { Promote } from "../game-models/turn-actions/promote.model";
import { Winner } from "../game-models/turn-actions/winner.model";

/*
  Concrete class that implements Chess-specific logic. Uses ChessLike as a template for logic that is true across Shogi, Chess, and other chess-like games
*/
@Injectable({
  providedIn: 'root'
})
export class ChessLogicService extends ChessLikeLogic {

  constructor(protected http: HttpClient, protected pieceBag: PieceBag) {
    super(pieceBag, http);
    this.kingPieces.push("CHE-King");
    this.kingPieces.push("CHE-King-Moved");
  }

  protected getPossibleMoves(game: Game, square: Square): RowColPosition[] {
    // if pawn, get special pawn moves
    // if king/rook, get special castling moves
    // else, get moves from superclass
    let possibleMoves: RowColPosition[] = [];
    if (square.piece.name == "CHE-Pawn") {
      possibleMoves = this.getPossiblePawnMoves(game, square);
      return possibleMoves;
    } else if (square.piece.name == "CHE-King") {
      possibleMoves = this.getPossibleKingMoves(game, square);
      return possibleMoves;
    }
    else {
      possibleMoves = super.getPossibleMoves(game, square);
    }
    return possibleMoves;
  }

  private getPossiblePawnMoves(game, square): RowColPosition[] {
    let possibleMoves: RowColPosition[] = super.getPossibleMoves(game, square); // Populate possible moves with pawn's default move (only 1 move by default)
    const squareRow = square.position.row;
    const squareCol = square.position.col;

    // If there is a move, check if the piece on that square is empty
    if (possibleMoves.length > 0) {
      let move = possibleMoves[0];
      // If there is a piece present on this square, remove the move
      if (game.squares[move.row][move.col].piece != null) {
        possibleMoves = [];
      }
    }

    if (square.piece.colour == "Black" && game.squares[squareRow + 1][squareCol].piece == null && game.squares[squareRow + 2][squareCol].piece == null) {
      // If black, add an extra tile "down"
      possibleMoves.push(new RowColPosition(square.position.row + 2, square.position.col));
    } else if (square.piece.colour == "White" && game.squares[squareRow - 1][squareCol].piece == null && game.squares[squareRow - 2][squareCol].piece == null) {
      possibleMoves.push(new RowColPosition(square.position.row -2, square.position.col));
    }

    // Add diagonals if opponent piece is present
    let takingRow = 0;
    let takingCol = square.position.col - 1;
    // Set taking row depending on whether piece is black or white
    if (square.piece.colour == "Black") {
      takingRow = square.position.row + 1;
    } else {
      takingRow = square.position.row - 1;
    }
    // Check diagonally left of piece

    if (this.isWithinBoard(game.getBoardSize(), takingRow, takingCol)) {
      const pieceToTake = game.squares[takingRow][takingCol].piece;
      if (pieceToTake != null && pieceToTake.colour != square.piece.colour) {
        possibleMoves.push(new RowColPosition(takingRow, takingCol));
      }
    }
    takingCol = square.position.col + 1;
    // Check square diagonally and right of piece
    if (this.isWithinBoard(game.getBoardSize(), takingRow, takingCol)) {
      const pieceToTake = game.squares[takingRow][takingCol].piece;
      if (pieceToTake != null && pieceToTake.colour != square.piece.colour) {
        possibleMoves.push(new RowColPosition(takingRow, takingCol));
      }
    }

    return possibleMoves;
  }


  //Will only be called for an unmoved king - moved kings will bypass this logic
  private getPossibleKingMoves(game, square): RowColPosition[] {
    let possibleMoves: RowColPosition[] = super.getPossibleMoves(game, square); // Populate possible moves with king's default move

    //Cannot castle if in check, so return default moves
    if (square.inCheck) {
      return possibleMoves;
    }

    // Add castling moves if possible
    let checkLeftOfKing = true;
    if (this.isValidCastle(game, square, checkLeftOfKing)) {
      const squareKingRow = square.position.row;
      const squareKingCol = square.position.col;
      possibleMoves.push(new RowColPosition(squareKingRow, squareKingCol - 2));
    }
    checkLeftOfKing = false;
    if (this.isValidCastle(game, square, checkLeftOfKing)) {
      const squareKingRow = square.position.row;
      const squareKingCol = square.position.col;
      possibleMoves.push(new RowColPosition(squareKingRow, squareKingCol + 2));
    }
    return possibleMoves;
  }

  private isValidCastle(game: Game, kingSquare: Square, checkLeftOfKing: boolean): boolean {
    const kingRow = kingSquare.position.row;
    const kingCol = kingSquare.position.col;
    const rookCol = checkLeftOfKing ? 0 : game.getBoardSize() - 1;
    const kingColour = kingSquare.piece.colour;

    let possibleRookPiece = game.squares[kingRow][rookCol].piece;
    if (possibleRookPiece != null && possibleRookPiece.colour == kingColour && possibleRookPiece.name == "CHE-Rook") {
      let castlingIsPossible = true;
      //check if there are any pieces between this and king
      if (checkLeftOfKing) {
        for (let col = 1; col < kingCol; col++) {
          if (game.squares[kingRow][col].piece != null) {
            castlingIsPossible = false;
            break; //castling is blocked, stop check
          }
        }
      } else { //check right of king
        for (let col = rookCol - 1; col > kingCol; col--) {
          if (game.squares[kingRow][col].piece != null) {
            castlingIsPossible = false;
            break; //castling is blocked, stop check
          }
        }
      }
      // Check if castling would put the king in check
      if (castlingIsPossible) {
        const moveCol = checkLeftOfKing ? kingCol - 2 : kingCol + 2;
        //Temporarily move piece
        const movePos = new RowColPosition(kingRow, moveCol);
        this.makeMove(game, kingSquare.position, movePos);
        castlingIsPossible = !this.checkForCheck(game, kingColour); //If player would become in check, castling is not possible
        game.squares[movePos.row][movePos.col].inCheck = false; // checkForCheck will highlight the square as in-check, so remove this temp setting
        this.unhighlightPossibleMoves(game);
        this.makeMove(game, movePos, kingSquare.position); //revert temp piece move
      }
      return castlingIsPossible;
    } else {
      return false;
    }
  }

  movePiece(game: Game, from: RowColPosition, to: RowColPosition) {
    let turn: Turn = new Turn(game.gameId); // Create new Turn object that will be populated by Actions.
    let startedInCheck = this.isPlayerInCheck(game, game.activeColour); //used to customise losing message if active player doesnt get themselves out of check

    // If king made a castling move, also move rook
    if (game.squares[from.row][from.col].piece.name == "CHE-King") {
      if (from.col - 2 == to.col && from.row == to.row) {
        console.log("left");
        let rookCurrentPos = new RowColPosition(from.row, 0);
        let rookToPos = new RowColPosition(from.row, from.col - 1);
        this.makeMove(game, rookCurrentPos, rookToPos);

        //Add castling to list of actions
        let moveAction: Move = new Move(rookCurrentPos, rookToPos);
        turn.addAction(moveAction);
      } else if (from.col + 2 == to.col && from.row == to.row) {
        console.log("right");
        let rookCurrentPos = new RowColPosition(from.row, game.getBoardSize() - 1);
        let rookToPos = new RowColPosition(from.row, from.col + 1);
        this.makeMove(game, rookCurrentPos, rookToPos);

        //Add castling to list of actions
        let moveAction: Move = new Move(rookCurrentPos, rookToPos);
        turn.addAction(moveAction);
      }
    }

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
    let pieceToCheckForPromotion = game.squares[to.row][to.col].piece;
    //Promotes to its "Moved" counterpart to prevent future Castling
    if (pieceToCheckForPromotion.name == "CHE-King" || pieceToCheckForPromotion.name == "CHE-Rook" || pieceToCheckForPromotion.name == "CHE-Pawn") {
      this.makePromote(game, to, pieceToCheckForPromotion.promotionPiece);
      let promoteAction: Promote = new Promote(to, pieceToCheckForPromotion.name);
      turn.addAction(promoteAction);
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

  highlightPossibleDrops(game: Game, dropPiece: Piece) {

  }

  dropPiece(game: Game, pieceToDrop: Piece, positionToDrop: RowColPosition) {

  }

  isFaceDown(colour: string) {
    return colour == "Black";
  }
}
