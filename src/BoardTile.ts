import Tile from "./Tile.js";
import * as Constants from "./Constants.js";

export default class BoardTile 
{
    private readonly _row       : number;
    private readonly _col       : number;
    private          _tile      : Tile | null;
    private          _type      : Constants.TileTypes;
    private          _wordMul   : number;
    private          _letterMul : number;
  
    constructor(row: number, col: number) 
    {
        this._row = row;
        this._col = col;
        this._tile = null;
        this._type = Constants.TileTypes.Regular;
        this._wordMul = 1;
        this._letterMul = 1;
    }
  
    get row(): number 
    {
        return this._row;
    }
  
    get col(): number 
    {
        return this._col;
    }

    get tile(): Tile | null
    {
        return this._tile;
    }

    set tile(tile: Tile | null) 
    {
        this._tile = tile;
    }

    get type(): Constants.TileTypes
    {
        return this._type;
    }

    set type(type: Constants.TileTypes) 
    {
        this._type = type;
    }

    get wordMultiplier(): number
    {
        return this._wordMul;
    }

    set wordMultiplier(value: number)
    {
        this._wordMul = value;
    }

    get letterMultiplier(): number
    {
        return this._letterMul;
    }

    set letterMultiplier(value: number)
    {
        this._letterMul = value;
    }

    public disableMultiplier() : void
    {
        this._wordMul = 1;
        this._letterMul = 1;
    }
}