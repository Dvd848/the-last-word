import {Tile} from "./Tile";

export enum TileTypes {
    Regular      = "Regular",
    DoubleWord   = "DoubleWord",
    DoubleLetter = "DoubleLetter",
    TripleWord   = "TripleWord",
    TripleLetter = "TripleLetter",
    CenterTile   = "CenterTile"
}

/**
 * BoardTile class represents a board tile.
 * @class
 */
export default class BoardTile 
{
    private readonly _row       : number;
    private readonly _col       : number;
    private          _tile      : Tile | null;
    private          _type      : TileTypes;
    private          _wordMul   : number;
    private          _letterMul : number;
  
    /**
     * Constructor for BoardTile class
     * @param row - row number of the tile
     * @param col - column number of the tile
     */
    constructor(row: number, col: number) 
    {
        this._row = row;
        this._col = col;
        this._tile = null;
        this._type = TileTypes.Regular;
        this._wordMul = 1;
        this._letterMul = 1;
    }
  
    /**
     * Getter for row property
     * @returns row number of the tile
     */
    get row(): number 
    {
        return this._row;
    }
  
    /**
     * Getter for col property
     * @returns column number of the tile
     */
    get col(): number 
    {
        return this._col;
    }

    /**
     * Getter for tile property
     * @returns Tile object or null if there is no tile on this board tile
     */
    get tile(): Tile | null
    {
        return this._tile;
    }

    /**
     * Setter for tile property
     * @param tile - Tile object to be set on this board tile
     */
    set tile(tile: Tile | null) 
    {
        this._tile = tile;
    }

    /**
     * Getter for type property
     * @returns type of this board tile (Regular, DoubleLetter, TripleLetter, DoubleWord, TripleWord)
     */
    get type(): TileTypes
    {
        return this._type;
    }

    /**
     * Setter for type property
     * @param type - type of this board tile (Regular, DoubleLetter, TripleLetter, DoubleWord, TripleWord)
     */
    set type(type: TileTypes) 
    {
        this._type = type;
    }

    /**
     * Getter for wordMultiplier property - the score for a word placed on this tile is multiplied by this factor
     * @returns word multiplier value of this board tile
     */
    get wordMultiplier(): number
    {
        return this._wordMul;
    }

    /**
     * Setter for wordMultiplier property - the score for a word placed on this tile is multiplied by this factor
     * @param value - word multiplier value to be set on this board tile
     */
    set wordMultiplier(value: number)
    {
        this._wordMul = value;
    }

    /**
     * Getter for letterMultiplier property - the score for a letter placed on this tile is multiplied by this factor
     * @returns letter multiplier value of this board tile (1 or 2 or 3)
     */
    get letterMultiplier(): number
    {
        return this._letterMul;
    }

    /**
     * Setter for letterMultiplier property -  - the score for a letter placed on this tile is multiplied by this factor
     * @param value - letter multiplier value to be set on this board tile (1 or 2 or 3)
     */
    set letterMultiplier(value: number)
    {
        this._letterMul = value;
    }

    /**
     * Disables both word and letter multipliers by setting them to 1.
     */
    public disableMultiplier() : void
    {
        this._wordMul = 1;
        this._letterMul = 1;
    }

    static fromJson(data: any): BoardTile {
        const tile = new BoardTile(data._row, data._col);
        tile.type = data._type;
        tile.wordMultiplier = data._wordMul;
        tile.letterMultiplier = data._letterMul;

        if (data._tile !== null) {
            tile.tile = Tile.fromJson(data._tile);
        } else {
            tile.tile = null;
        }

        return tile;
    }
}