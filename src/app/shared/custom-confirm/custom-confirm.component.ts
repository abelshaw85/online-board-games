import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmData {
  heading: string;
  text: string;
  confirmAction: string;
  declineAction: string;
}

// REMEMBER: Add an import to this component in the module imports!
@Component({
  selector: 'custom-confirm-dialog',
  templateUrl: 'custom-confirm.component.html',
})
export class CustomConfirmDialogue {

  constructor(
    public dialogRef: MatDialogRef<CustomConfirmDialogue>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmData) {
      dialogRef.disableClose = true;
    }

  onOKClick(): void {
    this.dialogRef.close();
  }
}
