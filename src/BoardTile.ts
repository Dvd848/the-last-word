import Tile from "./Tile.js";

export default class BoardTile 
{
    private readonly _row  : number;
    private readonly _col  : number;
    private          _tile : Tile | null;
  
    constructor(row: number, col: number) 
    {
        this._row = row;
        this._col = col;
        this._tile = null;
    }
  
    get row(): number 
    {
        return this._row;
    }
  
    get col(): number 
    {
        return this._col;
    }
}