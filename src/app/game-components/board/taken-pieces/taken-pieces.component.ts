import { Component, Input, OnInit } from '@angular/core';
import { Square } from '../../square/square.model';

@Component({
  selector: 'app-taken-pieces',
  templateUrl: './taken-pieces.component.html',
  styleUrls: ['./taken-pieces.component.css']
})
export class TakenPiecesComponent implements OnInit {
  @Input() takenPieces: Square[] = [];
  @Input() heading: string = "";
  @Input() showTurn: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
