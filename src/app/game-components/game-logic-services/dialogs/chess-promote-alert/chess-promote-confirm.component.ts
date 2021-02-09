import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Piece } from "src/app/game-components/game-models/piece.model";

export interface PieceData {
  piece: Piece;
}

export interface PieceDetails {
  name: string,
  imgUrl: string
}

@Component({
  selector: 'chess-promote-alert',
  templateUrl: 'chess-promote-alert.component.html',
})
export class ChessPromoteConfirmDialog {
  pieceDetails: PieceDetails[] = [
    { name: "CHE-Queen", imgUrl: "assets/img/chess-pieces-svg/queen" },
    { name: "CHE-Rook-Moved", imgUrl: "assets/img/chess-pieces-svg/rook" },
    { name: "CHE-Bishop", imgUrl: "assets/img/chess-pieces-svg/bishop" },
    { name: "CHE-Knight", imgUrl: "assets/img/chess-pieces-svg/knight" }
  ];

  constructor(
    public dialogRef: MatDialogRef<ChessPromoteConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PieceData) {
      console.log(this.pieceDetails);
    }
}
