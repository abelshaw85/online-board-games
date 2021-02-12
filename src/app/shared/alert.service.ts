import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CustomAlertDialogue } from "src/app/shared/custom-alert/custom-alert.component";
import { CustomConfirmDialogue } from "./custom-confirm/custom-confirm.component";

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(public dialog: MatDialog) {}

  async openAlert(heading: string, text: string, width: string = "35") {
    const dialogRef = this.dialog.open(CustomAlertDialogue, {
      width: width + '%',
      data: {
        heading: heading,
        text: text
      }
    });

    await dialogRef.afterClosed().toPromise().then(result => {
      //this.promotePiece = result;
    });
  }

  async openConfirm(heading: string, text: string, confirmAction: string, declineAction: string, width: string = "35") {
    const dialogRef = this.dialog.open(CustomConfirmDialogue, {
      width: width + '%',
      data: {
        heading: heading,
        text: text,
        confirmAction: confirmAction,
        declineAction: declineAction
      }
    });

    return dialogRef.afterClosed().toPromise();
  }
}

