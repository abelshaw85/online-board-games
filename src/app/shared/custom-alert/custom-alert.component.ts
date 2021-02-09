import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface AlertData {
  heading: string;
  text: string;
}

// REMEMBER: Add an import to this component in the module imports!
@Component({
  selector: 'custom-alert-dialog',
  templateUrl: 'custom-alert.component.html',
})
export class CustomAlertDialogue {

  constructor(
    public dialogRef: MatDialogRef<CustomAlertDialogue>,
    @Inject(MAT_DIALOG_DATA) public data: AlertData) {}

  onOKClick(): void {
    this.dialogRef.close();
  }
}
