import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Piece } from '../piece/piece.model';
import { RowColPosition } from '../square/row-col-position.model';
import { Square } from '../square/square.model';
import { environment } from '../../../environments/environment';
import { PieceBag } from './piece-bag.service';
import { Player } from '../player/player.model';

@Injectable()
export class GameService {
  private BOARD_SIZE: number = 9;
  private squares: Square[][];
  gameLog: string[] = [];
  gameUpdated = new Subject<Square[][]>();
  takenByBlackUpdated = new Subject<Square[]>();
  takenByWhiteUpdated = new Subject<Square[]>();
  gameLogUpdated = new Subject<string[]>();
  playersSet = new Subject<{"Black":Player, "White": Player}>();
  private takenByBlack: Square[] = [];
  private takenByWhite: Square[] = [];
  blacksTurn: boolean;
  turnChanged = new Subject<boolean>();
  player1: Player;
  player2: Player;


  constructor(private httpClient: HttpClient, private pieceBag: PieceBag) {
  }

  new(player1: Player, player2: Player) {
    let whoGoesFirst: number = Math.floor(Math.random() * 2);
    player1.colour = whoGoesFirst == 0 ? "Black" : "White";
    player2.colour = whoGoesFirst != 0 ? "Black" : "White";
    this.player1 = player1;
    this.player2 = player2;
    this.playersSet.next({
      Black: player1.colour == "Black" ? player1 : player2,
      White: player1.colour == "White" ? player1 : player2,
    });
    this.blacksTurn = true;
    this.turnChanged.next(this.blacksTurn);
    this.squares = new Array<Array<Square>>(); // Set the array to be an array of arrays of Squares
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      let row: Square[]  = new Array<Square>(); //create a new Square[]
      for (let j = 0; j < this.BOARD_SIZE; j++) {
        row.push(new Square(null, new RowColPosition(i, j))); //add Square to the ROW
      }
      this.squares.push(row); //add row to the Square[][]
    }
    this.setupBoard();

  }

  setupBoard() {
      //Set up black pieces
      this.httpClient.get<{'pieceName': string, 'position': {'row': number, 'col': number}}[]>(environment.boardJson).subscribe((fetchedStartingPositions) => {
        for (var fetchedPosition of fetchedStartingPositions["Black"]) {
          let piece: Piece = this.pieceBag.getPieceByName(fetchedPosition["pieceName"]);
          piece.colour = "Black";
          let row: number = fetchedPosition["position"]["row"];
          let col: number = fetchedPosition["position"]["col"];
          if (piece.name === "Pawn") {
            for (let i = 0; i < this.BOARD_SIZE; i++) {
              this.squares[row][i].piece = piece;
            }
          }
          this.squares[row][col].piece = piece;
        }

        //Set up white pieces by mirroring the black pieces, then adding the 2nd line rook/bishop
        let endRow = this.squares[this.BOARD_SIZE - 1];
        let frontRow = this.squares[this.BOARD_SIZE - 3];
        for (let i = 0; i < endRow.length; i++) {
          this.squares[0][i].piece = this.pieceBag.getPieceByName(endRow[i].piece.name, true); //true makes the piece move downwards
          this.squares[0][i].piece.colour = "White";
          this.squares[2][i].piece = this.pieceBag.getPieceByName(frontRow[i].piece.name, true)
          this.squares[2][i].piece.colour = "White";
        }
        for (var fetchedPosition of fetchedStartingPositions["White"]) {
          let piece: Piece = this.pieceBag.getPieceByName(fetchedPosition["pieceName"], true);
          piece.colour = "White";
          let row: number = fetchedPosition["position"]["row"];
          let col: number = fetchedPosition["position"]["col"];
          this.squares[row][col].piece = piece;
        }
    });
    this.gameLog.push("A New Shogi Game! It is Black's turn.");
    this.gameLogUpdated.next(this.gameLog.slice());
  }

  getSquares() {
    return this.squares;
  }

  getTakenPieces(player: string) {
    return player === "Black" ? this.takenByBlack.slice() : this.takenByWhite.slice();
  }

  dropPiece(pieceToDrop: Piece, positionToDrop: RowColPosition) {
    if (this.isInHand(pieceToDrop) && this.squares[positionToDrop.row][positionToDrop.col].piece == null) {
      // make copy of the piece
      let copy: Piece = Object.assign({}, pieceToDrop);
      // drop piece down
      this.squares[positionToDrop.row][positionToDrop.col].piece = copy;

      this.squares[positionToDrop.row][positionToDrop.col].piece.taken = false;
      this.removeFromHand(pieceToDrop);
      this.gameLog.push(pieceToDrop.colour + " has dropped a " + pieceToDrop.name);
      this.checkForCheck();
      this.toggleTurn();
      this.gameLogUpdated.next(this.gameLog.slice());
    }
  }

  isInHand(piece: Piece) {
    if (piece.colour == "White") {
      return this.takenByWhite.find((square) => square.piece.name == piece.name) != undefined;
    } else {
      return this.takenByBlack.find((square) => square.piece.name == piece.name) != undefined;
    }
  }

  removeFromHand(piece: Piece) {
    if (piece.colour == "White") {
      let index: number = this.takenByWhite.findIndex((square) => {
        return square.piece.name == piece.name;
      });
      this.takenByWhite.splice(index, 1);
      this.takenByWhiteUpdated.next(this.takenByWhite.slice());

    } else {
      let index: number = this.takenByBlack.findIndex((square) => {
        return square.piece.name == piece.name;
      });
      this.takenByBlack.splice(index, 1);
      this.takenByBlackUpdated.next(this.takenByBlack.slice());
    }
  }

  movePiece(from: RowColPosition, to: RowColPosition) {
    let movingPiece: Piece = this.squares[from.row][from.col].piece;
    this.gameLog.push(movingPiece.colour + " moved their " + movingPiece.name + ".");

    // If square has a piece to take, add it to player's hand
    if (this.squares[to.row][to.col].piece != null) {
      let capturedPiece: Piece = Object.assign({}, this.squares[to.row][to.col].piece);
      this.gameLog.push(movingPiece.colour + "'s " + movingPiece.name + " captured " + capturedPiece.colour + "'s " + capturedPiece.name + ".");

      //Captured pieces must unpromote
      if (capturedPiece.promoted) {
        capturedPiece = this.pieceBag.unpromotePiece(capturedPiece.name, this.getActiveColour() == "White");
      } else {
        capturedPiece = this.pieceBag.getPieceByName(capturedPiece.name, this.getActiveColour() == "White");
      }
      capturedPiece.colour = this.getActiveColour();
      capturedPiece.taken = true;
      this.squares[to.row][to.col].piece = capturedPiece;

      //Add captured piece to hand
      let copy = Object.assign({}, this.squares[to.row][to.col]);
      copy.position = new RowColPosition(-1, -1);
      if (this.getActiveColour() === "White") {
        this.takenByWhite.push(copy);
        this.takenByWhiteUpdated.next(this.takenByWhite.slice());
      } else {
        this.takenByBlack.push(copy);
        this.takenByBlackUpdated.next(this.takenByBlack.slice());
      }
    }

    // make moving piece's previous square empty
    this.squares[from.row][from.col].piece = null;

    // Move piece
    this.squares[to.row][to.col].piece = movingPiece;
    this.gameUpdated.next(this.squares);
    // replace piece with promoted piece if applicable
    if (this.canPromote(to.row, movingPiece)) {
      if (this.isEnforcedPromote(to.row, movingPiece) || confirm("This piece can be promoted to " + movingPiece.promotionPiece + ", would you like to promote this piece?")) {
        let promotedPiece: Piece = this.pieceBag.promotePiece(movingPiece.name, this.getActiveColour() == "White");
        promotedPiece.colour = this.getActiveColour();
        this.squares[to.row][to.col].piece = promotedPiece;
        this.gameUpdated.next(this.squares); // Update again to show change
        this.gameLog.push(movingPiece.colour + " promoted their " + movingPiece.name + " to " + promotedPiece.name + ".");
      }
    }
    this.unhighlightCheck();
    if (this.checkForCheck()) {
      if (this.isCheckMate()) {
        alert("Checkmate!");
      }
    }
    this.toggleTurn();
    this.gameLogUpdated.next(this.gameLog.slice());
  }

  //pieceName: string, position: RowColPosition, player: string) {
  highlightPossibleMoves(position: RowColPosition) {
    // set current square
    let currentSquare = this.getSquare(position);
    currentSquare.current = true;

    this.getPossibleMoves(currentSquare).forEach(move => {
      let squareToMoveTo: Square = this.squares[move.row][move.col];
      if (squareToMoveTo.piece == null) {
        squareToMoveTo.active = true;
      } else if (squareToMoveTo.piece.colour != currentSquare.piece.colour) {
        squareToMoveTo.danger = true;
      }
    });
    this.gameUpdated.next(this.squares);
  }

  getPossibleMoves(square: Square): RowColPosition[] {
    let possibleMoves: RowColPosition[] = [];
    let position: RowColPosition = square.position;
    square.piece.moves.forEach((move) => {
      let moveRow = move.row;
      let moveCol = move.col;
      while (true) {
        if (this.isWithinBoard(position.row + moveRow, position.col + moveCol)) {
          let squareToMoveTo: Square = this.squares[position.row + moveRow][position.col + moveCol];
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

  highlightDrops(dropPiece: Piece) {
    let copy = Object.assign({}, dropPiece);
    let pawnCounts = new Array(this.squares.length).fill(0);
    // pawns cannot drop in columns where 2 pawns of the same colour already exist
    if (dropPiece.name == "Pawn") {
      for (let row = 0; row < this.squares.length; row++) {
        for (let col = 0; col < this.squares[row].length; col++) {
          if (this.squares[row][col].piece != null && this.squares[row][col].piece.name == "Pawn" && this.squares[row][col].piece.colour == dropPiece.colour) {
            pawnCounts[col] += 1;
          }
        }
      }
    }
    let isOmnidirectional: boolean = (dropPiece.moves.find((move) => move.row > 0) != undefined && dropPiece.moves.find((move) => move.row < 0) != undefined);
    console.log(isOmnidirectional);
    for (let row = 0; row < this.squares.length; row++) {
      for (let col = 0; col < this.squares[row].length; col++) {
        if (this.squares[row][col].piece == null && pawnCounts[col] < 2) {
          if (!isOmnidirectional) {
            this.squares[row][col].piece = copy;
            if (this.getPossibleMoves(this.squares[row][col]).length > 0) {// if a piece can only move forwards, it must have a valid move after being dropped.
              this.squares[row][col].active = true;
            }
            this.squares[row][col].piece = null;
          } else {
            this.squares[row][col].active = true;
          }
          // //if dropping this piece would cause checkmate, it is an illegal move
          // this.squares[row][col].piece = copy;
          // if (this.checkForCheck() && this.isCheckMate()) {
          //   this.squares[row][col].active = false;
          // }
          // this.squares[row][col].piece = null;
        }
      }
    }
  }

  unhighlightPossibleMoves() {
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      for (let j = 0; j < this.BOARD_SIZE; j++) {
        this.squares[i][j].active = false;
        this.squares[i][j].danger = false;
        this.squares[i][j].current = false;
      }
    }
    this.takenByBlack.forEach((square) => {
      square.active = false;
      square.danger = false;
      square.current = false;
    });
    this.takenByWhite.forEach((square) => {
      square.active = false;
      square.danger = false;
      square.current = false;
    });
    this.gameUpdated.next(this.squares);
  }

  unhighlightCheck() {
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      for (let j = 0; j < this.BOARD_SIZE; j++) {
        this.squares[i][j].inCheck = false;
      }
    }
  }

  isPossibleMove(position: RowColPosition) {
    if (this.isWithinBoard(position.row, position.col)) {
      return (this.squares[position.row][position.col].active ||
            this.squares[position.row][position.col].danger)
    }
    return false;
  }

  canPromote(row: number, piece: Piece): boolean {
    if (piece.promotionPiece != null) {
      // if a white piece is in the bottom 3 rows
      if (piece.colour == "White" && row >= this.BOARD_SIZE - 3) {
        return true;
      // if a black piece is in the top 3 rows
      } else if (piece.colour == "Black" && row <= 2) {
        return true;
      }
    }
    return false;
  }

  isEnforcedPromote(row: number, piece: Piece): boolean {
    if (piece.enforcedPromotionRow >= 0) {
      if (piece.colour == "White" && row >= (this.BOARD_SIZE - 1 - piece.enforcedPromotionRow)) {
        return true;
      } else if (piece.colour == "Black" && row <= (0 + piece.enforcedPromotionRow)) {
        return true;
      }
    }
  }

  private isWithinBoard(row: number, col: number): boolean {
    return (row >= 0 && row < this.BOARD_SIZE) && (col >= 0 && col < this.BOARD_SIZE);
  }

  getActiveColour(): string {
    return this.blacksTurn ? "Black" : "White";
  }

  toggleTurn() {
    this.blacksTurn = !this.blacksTurn;
    this.turnChanged.next(this.blacksTurn);
  }

  checkForCheck(): boolean {
    this.unhighlightPossibleMoves(); //Reset board to remove previous highlights
    let kingPositions: RowColPosition[] = [];
    this.squares.forEach((row) => {
      row.forEach((square) => {
        if (square.piece != null && square.piece != undefined) {
          this.highlightPossibleMoves(square.position);
          if (square.piece.name == "King General" || square.piece.name == "Jeweled General") {
            kingPositions.push(Object.assign({}, square.position));
          }
        }
      });
    });
    let kingSquares: Square[] = [];
    kingPositions.forEach((kingSquarePosition) => {
      kingSquares.push(Object.assign({}, this.squares[kingSquarePosition.row][kingSquarePosition.col])); //make a copy of the king squares before removing highlight
    });
    this.unhighlightPossibleMoves(); //clear board before applying in-check highlights
    this.unhighlightCheck();
    let boardContainsCheck = false;
    kingSquares.forEach((kingSquare) => {
      if (kingSquare.danger) { //if copy is in danger, add in-check to original
        this.squares[kingSquare.position.row][kingSquare.position.col].inCheck = true;
        boardContainsCheck = true;
      } else {
        this.squares[kingSquare.position.row][kingSquare.position.col].inCheck = false;
      }
    });
    return boardContainsCheck;
  }

  isCheckMate(): boolean {
    let checkedColour: string;
    for (let row of this.squares) {
      for (let square of row) {
        if (square.inCheck) {
          checkedColour = square.piece.colour;
          return;
        }
      }
    }
    for (let row of this.squares) {
      for (let square of row) {
        if (square.piece != null && square.piece.colour == checkedColour) {
          let possibleMoves: RowColPosition[] = this.getPossibleMoves(Object.assign({}, square));
          for (let move of possibleMoves) {
            //make copy of the squares
            let fromSquarePiece = Object.assign({}, square.piece);
            let toSquarePiece = Object.assign({}, this.squares[move.row][move.col].piece);

            this.squares[move.row][move.col].piece = Object.assign({}, fromSquarePiece);
            this.squares[square.position.row][square.position.col].piece = null;

            let stillInCheck: boolean = this.checkForCheck();
            //set board back to previous state
            this.squares[square.position.row][square.position.col].piece = Object.assign({}, fromSquarePiece);

            // Will typically assign an empty object instead of null, so need to manually set null if object has no properties
            this.squares[move.row][move.col].piece = Object.keys(toSquarePiece).length > 0 ?
              this.squares[move.row][move.col].piece = Object.assign({}, toSquarePiece) :
              this.squares[move.row][move.col].piece = null;

            if (!stillInCheck) {
              this.checkForCheck(); //re-applies check to checked piece
              return false; //if no longer check, then there is a move to escape check
            }
          }
        }
      }
    }
    return true;
  }

  getSquare(position: RowColPosition): Square {
    return this.squares[position.row][position.col];
  }
}
