import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MaterialModule } from "./material.module";
import { CustomTableComponent } from "./custom-table/custom-table.component";
import { LoadingSpinnerComponent } from "./loading-spinner/loading-spinner.component";
import { CustomConfirmDialogue } from "./custom-confirm/custom-confirm.component";

@NgModule({
  declarations: [
    CustomTableComponent,
    LoadingSpinnerComponent,
    CustomConfirmDialogue
  ],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MaterialModule
  ],
  exports: [
    CustomTableComponent,
    LoadingSpinnerComponent,
    CustomConfirmDialogue,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MaterialModule
  ]
})
export class SharedModule {

}
