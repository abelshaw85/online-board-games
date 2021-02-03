import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Piece } from "../game-models/piece.model";
import { RowColPosition } from "../game-models/row-col-position.model";

@Injectable()
export class PieceBag {
  private pieces: Piece[] = [];

  constructor(private httpClient: HttpClient) {
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
    });
  }

  getPieceByName(name: string, faceDown = false): Piece {
    let fetchedPiece: Piece = Object.assign({}, this.pieces.find(x => x.name === name));
    let moves: RowColPosition[] = [];
    fetchedPiece.moves.forEach((move) => {
      let moveRow = move.row;
      let moveCol = move.col;
      if (faceDown) {
        moveRow = moveRow * -1;
      }
      moves.push(new RowColPosition(moveRow, moveCol));
    });
    fetchedPiece.moves = moves;
    return fetchedPiece;
  }

  isExtended(name: string): boolean {
    return this.getPieceByName(name).extended;
  }

  promotePiece(unpromotedPieceName: string, faceDown = false): Piece {
    let nameOfpromotedPiece = this.pieces.find(piece => piece.name === unpromotedPieceName).promotionPiece;
    let promotedPiece: Piece = Object.assign({}, this.getPieceByName(nameOfpromotedPiece, faceDown));
    return promotedPiece;
  }

  unpromotePiece(promotedPieceName: string, faceDown = false): Piece {
    let nameOfUnpromotedPiece = this.pieces.find(piece => piece.promotionPiece === promotedPieceName).name;
    let unpromotedPiece: Piece = this.getPieceByName(nameOfUnpromotedPiece, faceDown);
    return unpromotedPiece;
  }
}
