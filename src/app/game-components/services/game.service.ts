import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Piece } from '../piece/piece.model';
import { RowColPosition } from '../square/row-col-position.model';
import { Square } from '../square/square.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class GameService {
  private BOARD_SIZE: number = 9;
  private squares: Square[][];
  gameUpdated = new Subject<Square[][]>();
  takenByBlackUpdated = new Subject<Square[]>();
  takenByWhiteUpdated = new Subject<Square[]>();
  gameLog: string[] = [];
  gameLogUpdated = new Subject<string[]>();
  private pieces: Piece[] = [];
  private takenByBlack: Square[] = [];
  private takenByWhite: Square[] = [];
  blacksTurn: boolean;
  turnChanged = new Subject<boolean>();


  constructor(private httpClient: HttpClient) {
  }

  new() {
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
    this.fetchPieces();

  }

  fetchPieces() {
    this.httpClient.get<Piece[]>(environment.piecesJson).subscribe((fetchedPieces) => {
      for (var piece of fetchedPieces["Pieces"]) {
        let name: string = piece["name"];
        let imgUrl: string = piece["imgUrl"];
        let size: number = piece["size"];
        let moves: RowColPosition[] = [];
        let promoted: boolean = piece["promoted"];
        // If this is a promoted piece, borrow moves from existing pieces
        if (promoted) {
          let movesToCopy: string[] = piece["moves"];
          movesToCopy.forEach((pieceName: string) => {
            let pieceToCopyMoves: Piece = this.getPieceByName(pieceName);
            pieceToCopyMoves.moves.forEach((pieceMove: RowColPosition) => {
              if (moves.filter((move) => move.row == pieceMove.row && move.col == pieceMove.col).length === 0) {
                moves.push(pieceMove);
              }
            });
          });
        } else {
          for (var move of <{'row': number, 'col': number}[]>piece["moves"]) {
            moves.push(new RowColPosition(move.row, move.col));
          }
        }
        let promotionPiece: string = null;
        let enforcedPromotionRow: number = -1;
        if (piece.hasOwnProperty('enforcedPromotionRow')) {
          enforcedPromotionRow = piece["enforcedPromotionRow"];
        }
        if (piece.hasOwnProperty('promotionPiece')) {
          promotionPiece = piece["promotionPiece"];
        }
        let extended: boolean = piece["extended"];
        let newPiece: Piece = new Piece(name, imgUrl, size, moves, null, promoted, promotionPiece, enforcedPromotionRow, extended);
        this.pieces.push(newPiece);
      }
      //Set up white pieces
      this.httpClient.get<{'pieceName': string, 'position': {'row': number, 'col': number}}[]>(environment.boardJson).subscribe((fetchedStartingPositions) => {
        for (var fetchedPosition of fetchedStartingPositions["Black"]) {
          let piece: Piece = this.getPieceByName(fetchedPosition["pieceName"]);
          piece.player = "Black";
          let row: number = fetchedPosition["position"]["row"];
          let col: number = fetchedPosition["position"]["col"];
          if (piece.name === "Pawn") {
            for (let i = 0; i < this.BOARD_SIZE; i++) {
              this.squares[row][i].piece = piece;
            }
          }
          this.squares[row][col].piece = piece;
        }

        //Set up white pieces
        let endRow = this.squares[this.BOARD_SIZE - 1];
        let frontRow = this.squares[this.BOARD_SIZE - 3];
        for (let i = 0; i < endRow.length; i++) {
          this.squares[0][i].piece = Object.assign({}, endRow[i].piece);
          this.squares[0][i].piece.player = "White";
          this.squares[2][i].piece = Object.assign({}, frontRow[i].piece);
          this.squares[2][i].piece.player = "White";
        }
        for (var fetchedPosition of fetchedStartingPositions["White"]) {
          let piece: Piece = this.getPieceByName(fetchedPosition["pieceName"]);
          piece.player = "White";
          let row: number = fetchedPosition["position"]["row"];
          let col: number = fetchedPosition["position"]["col"];
          this.squares[row][col].piece = piece;
        }
      });
    });
    this.gameLog.push("A New Shogi Game! It is Black's turn.");
    this.gameLogUpdated.next(this.gameLog.slice());
  }

  getPieceByName(name: string): Piece {
    return Object.assign({}, this.pieces.find(x => x.name === name));
  }

  isExtended(name: string): boolean {
    return this.getPieceByName(name).extended;
  }

  getSquares() {
    return this.squares;
  }

  getTakenPieces(player: string) {
    return player === "Black" ? this.takenByBlack.slice() : this.takenByWhite.slice();
  }

  dropPiece(pieceToDrop: Piece, positionToDrop: RowColPosition) {
    if (this.isInHand(pieceToDrop)) {
      this.removeFromHand(pieceToDrop);
      pieceToDrop.taken = false;
      this.squares[positionToDrop.row][positionToDrop.col].piece = Object.assign({}, pieceToDrop);
    }
    this.gameLog.push(pieceToDrop.player + " has dropped a " + pieceToDrop.name);
    if (!this.checkForCheck()) {
      this.unhighlightPossibleMoves();
    }
    this.toggleTurn()
    this.gameLogUpdated.next(this.gameLog.slice());

  }

  isInHand(piece: Piece) {
    if (piece.player == "White") {
      return this.takenByWhite.find((square) => square.piece.name == piece.name) != undefined;
    } else {
      return this.takenByBlack.find((square) => square.piece.name == piece.name) != undefined;
    }
  }

  removeFromHand(piece: Piece) {
    if (piece.player == "White") {
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
    // Capture piece
    let movingPiece: Piece = this.squares[from.row][from.col].piece;
    this.gameLog.push(movingPiece.player + " moved their " + movingPiece.name + ".");
    if (this.squares[to.row][to.col].piece != null) {
      let capturedPiece: Piece = Object.assign({}, this.squares[to.row][to.col].piece);
      capturedPiece.taken = true;
      this.gameLog.push(movingPiece.player + "'s " + movingPiece.name + " captured " + capturedPiece.player + "'s " + capturedPiece.name + ".");
      capturedPiece = this.unpromotePiece(capturedPiece);
      this.squares[to.row][to.col].piece = capturedPiece;
      if (capturedPiece.player === "Black") {
        capturedPiece.player = "White"; //piece switches sides once captured
        this.takenByWhite.push(Object.assign({}, this.squares[to.row][to.col]));
        this.takenByWhiteUpdated.next(this.takenByWhite.slice());
      } else {
        capturedPiece.player = "Black";
        //this.takenByBlack.push(capturedPiece);
        this.takenByBlack.push(Object.assign({}, this.squares[to.row][to.col]));
        this.takenByBlackUpdated.next(this.takenByBlack.slice());
      }

    }

    this.squares[from.row][from.col].piece = null;

    // Move piece
    this.squares[to.row][to.col].piece = movingPiece;
    this.gameUpdated.next(this.squares);
    // replace piece with promoted piece if applicable
    if (this.canPromote(to.row, movingPiece)) {
      if (this.isEnforcedPromote(to.row, movingPiece) || confirm("This piece can be promoted to " + movingPiece.promotionPiece + ", would you like to promote this piece?")) {
        let promotedPiece: Piece = this.getPieceByName(movingPiece.promotionPiece);
        promotedPiece.player = movingPiece.player;
        this.squares[to.row][to.col].piece = promotedPiece;
        this.gameUpdated.next(this.squares); // Update again to show change
        this.gameLog.push(movingPiece.player + " promoted their " + movingPiece.name + " to " + promotedPiece.name + ".");
      }
    }
    if (!this.checkForCheck()) {
      this.unhighlightPossibleMoves();
    }
    this.toggleTurn();
    this.gameLogUpdated.next(this.gameLog.slice());
  }

  unpromotePiece(promotedPiece: Piece): Piece {
    if (promotedPiece.promoted) {
      let unpromotedPiece: Piece = Object.assign({}, this.pieces.find(x => x.promotionPiece === promotedPiece.name));
      unpromotedPiece.player = promotedPiece.player;
      unpromotedPiece.taken = promotedPiece.taken;
      return unpromotedPiece;
    } else {
      return Object.assign({}, promotedPiece);
    }
  }

  highlightPossibleMoves(pieceName: string, position: RowColPosition, player: string) {
    // set current square
    this.squares[position.row][position.col].current = true;
    let piece: Piece = this.getPieceByName(pieceName);
    piece.moves.forEach(move => {
      let moveRow = move.row;
      let moveCol = move.col;
      // If player is White, their pieces are moving down, so reverse the sign of the row.
      if (player != null && player === "White") {
        moveRow = move.row * -1;
      }

      while (true) {
        if (this.isWithinBoard(position.row + moveRow, position.col + moveCol)) {
          let squareToMoveTo: Square = this.squares[position.row + moveRow][position.col + moveCol];

          // Only move if the tile is not occupied by the same colour pieces as the player
          if (squareToMoveTo.piece == null) {
            this.squares[position.row + moveRow][position.col + moveCol].active = true;
          }
          // Show if an opponent's piece is in danger
          else if (squareToMoveTo.piece.player != player) {
            this.squares[position.row + moveRow][position.col + moveCol].danger = true;
            return;
          }
          // Don't highlight squares possessed by moving player, and stop highlighting further squares along that path
          else if (squareToMoveTo.piece != null) {
              return;
          }

          // exit the loop if piece is not extended (can move more than 1 square)
          if (!this.isExtended(pieceName)) {
            return; //acts like continue;
          }
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
          return; //if out of bounds, exit loop
        }
      }
    });
    this.gameUpdated.next(this.squares);
  }

  highlightDrops() {
    this.squares.forEach((row) => {
      row.forEach((square) => {
        if (square.piece === null) {
          square.active = true;
        }
      });
    });
  }

  unhighlightPossibleMoves() {
    for (let i = 0; i < this.BOARD_SIZE; i++) {
      for (let j = 0; j < this.BOARD_SIZE; j++) {
        this.squares[i][j].active = false;
        this.squares[i][j].danger = false;
        this.squares[i][j].current = false;
        this.squares[i][j].inCheck = false;
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

  isPossibleMove(position: RowColPosition) {
    return this.squares[position.row][position.col].active || this.squares[position.row][position.col].danger;
  }

  canPromote(row: number, piece: Piece): boolean {
    if (piece.promotionPiece != null) {
      // if a white piece is in the bottom 3 rows
      if (piece.player == "White" && row >= this.BOARD_SIZE - 3) {
        return true;
      // if a black piece is in the top 3 rows
      } else if (piece.player == "Black" && row <= 2) {
        return true;
      }
    }
    return false;
  }

  isEnforcedPromote(row: number, piece: Piece): boolean {
    if (piece.enforcedPromotionRow >= 0) {
      if (piece.player == "White" && row >= (this.BOARD_SIZE - 1 - piece.enforcedPromotionRow)) {
        return true;
      } else if (piece.player == "Black" && row <= (0 + piece.enforcedPromotionRow)) {
        return true;
      }
    }
  }

  private isWithinBoard(row: number, col: number): boolean {
    return (row >= 0 && row < this.BOARD_SIZE) && (col >= 0 && col < this.BOARD_SIZE);
  }

  getActivePlayer(): string {
    return this.blacksTurn ? "Black" : "White";
  }

  toggleTurn() {
    this.blacksTurn = !this.blacksTurn;
    this.turnChanged.next(this.blacksTurn);
  }

  checkForCheck(): boolean {
    let activePlayer = this.getActivePlayer();
    let kingSquare: Square;
    this.squares.forEach((row) => {
      row.forEach((square) => {
        if (square.piece != null) {
          if (square.piece.player == activePlayer) {
            this.highlightPossibleMoves(square.piece.name, square.position, activePlayer);
          } else if (square.piece.name == "King General" || square.piece.name == "Jewled General") {
            kingSquare = square;
          }
        }
      });
    });
    if (kingSquare.danger) {
      this.unhighlightPossibleMoves();
      kingSquare.inCheck = true;
      return true;
    }
    return false;
  }
}
