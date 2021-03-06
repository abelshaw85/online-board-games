import { Component, Input } from "@angular/core";
import { Piece } from "src/app/game/game-models/piece.model";
import { PieceDetails } from "../chess-promote-confirm.component";

export interface PieceData {
  piece: Piece;
}

/* Used in the Chess promotion alert */
@Component({
  selector: 'app-selectable-piece',
  templateUrl: 'selectable-piece.component.html',
  styleUrls: ['selectable-piece.component.css']
})
export class SelectablePieceComponent {
  @Input() pieceDetail: PieceDetails;
  @Input() colour: string;

  constructor() {}

  getPieceImgUrl() {
    if (this.colour == "White") {
      return this.pieceDetail.imgUrl + "-wht.svg";
    } else {
      return this.pieceDetail.imgUrl + "-blk.svg";
    }
  }
}
