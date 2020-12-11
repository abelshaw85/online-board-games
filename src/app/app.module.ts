import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BoardComponent } from './game-components/board/board.component';
import { SquareComponent } from './game-components/square/square.component';
import { PieceComponent } from './game-components/piece/piece.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatTooltipModule} from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { TakenPiecesComponent } from './game-components/board/taken-pieces/taken-pieces.component';


@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    SquareComponent,
    PieceComponent,
    TakenPiecesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DragDropModule,
    MatTooltipModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
