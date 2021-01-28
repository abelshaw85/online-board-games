import { Piece } from './piece.model';
import { RowColPosition } from './row-col-position.model';

export class Square {
  inCheck: boolean;
  constructor(
    public piece: Piece,
    public position: RowColPosition = null,
    public active: boolean = false,
    public danger: boolean = false,
    public current: boolean = false
  ) { }
}
