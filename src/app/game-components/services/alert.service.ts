import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CustomAlertDialogue } from "src/app/shared/custom-alert/custom-alert.component";

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
}

