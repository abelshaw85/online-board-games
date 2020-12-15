import { RowColPosition } from '../square/row-col-position.model';

export class Piece {
  constructor(
    public name: string,
    public imgUrl: string,
    public size: number,
    public moves: RowColPosition[],
    public colour?: string,
    public promoted: boolean = false,
    public promotionPiece: string = null,
    public enforcedPromotionRow: number = -1,
    public extended: boolean = false,
    public taken: boolean = false,
  ) { }
}
