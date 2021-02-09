import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Piece } from "../../game-models/piece.model";

export interface PieceData {
  piece: Piece;
}

// REMEMBER: Add an import to this component in the module imports!
@Component({
  selector: 'shogi-promote-confirm',
  templateUrl: 'shogi-promote-confirm.component.html',
})
export class ShogiPromoteConfirmDialog {

  constructor(
    public dialogRef: MatDialogRef<ShogiPromoteConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PieceData) {}
}
