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
     * Constructor for BoardTile class.
     * Initializes the tile with default multipliers and type.
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
     * Getter for row property.
     * @returns Row number of the tile.
     */
    get row(): number 
    {
        return this._row;
    }
  
    /**
     * Getter for col property.
     * @returns Column number of the tile.
     */
    get col(): number 
    {
        return this._col;
    }

    /**
     * Getter for tile property.
     * @returns Tile object or null if there is no tile on this board tile.
     */
    get tile(): Tile | null
    {
        return this._tile;
    }

    /**
     * Setter for tile property.
     * @param tile - Tile object to be set on this board tile.
     */
    set tile(tile: Tile | null) 
    {
        this._tile = tile;
    }

    /**
     * Getter for type property.
     * @returns Type of this board tile (Regular, DoubleLetter, TripleLetter, DoubleWord, TripleWord, CenterTile).
     */
    get type(): TileTypes
    {
        return this._type;
    }

    /**
     * Setter for type property.
     * @param type - Type of this board tile.
     */
    set type(type: TileTypes) 
    {
        this._type = type;
    }

    /**
     * Getter for wordMultiplier property - the score for a word placed on this tile is multiplied by this factor.
     * @returns Word multiplier value of this board tile.
     */
    get wordMultiplier(): number
    {
        return this._wordMul;
    }

    /**
     * Setter for wordMultiplier property - the score for a word placed on this tile is multiplied by this factor.
     * @param value - Word multiplier value to be set on this board tile.
     */
    set wordMultiplier(value: number)
    {
        this._wordMul = value;
    }

    /**
     * Getter for letterMultiplier property - the score for a letter placed on this tile is multiplied by this factor.
     * @returns Letter multiplier value of this board tile (1 or 2 or 3).
     */
    get letterMultiplier(): number
    {
        return this._letterMul;
    }

    /**
     * Setter for letterMultiplier property - the score for a letter placed on this tile is multiplied by this factor.
     * @param value - Letter multiplier value to be set on this board tile (1 or 2 or 3).
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

    /**
     * Creates a BoardTile instance from a JSON object.
     * @param data The JSON data representing the board tile.
     * @returns A BoardTile instance.
     */
    static fromJson(data: any): BoardTile 
    {
        // Validate row and col
        if (typeof data._row !== "number" || data._row < 0 || !Number.isInteger(data._row)) {
            throw new Error("Invalid row value");
        }
        if (typeof data._col !== "number" || data._col < 0 || !Number.isInteger(data._col)) {
            throw new Error("Invalid col value");
        }
        // Validate type
        if (typeof data._type !== "string" || !(Object.values(TileTypes) as string[]).includes(data._type)) {
            throw new Error("Invalid tile type");
        }
        // Validate word and letter multipliers
        if (typeof data._wordMul !== "number" || ![1,2,3].includes(data._wordMul)) {
            throw new Error("Invalid word multiplier");
        }
        if (typeof data._letterMul !== "number" || ![1,2,3].includes(data._letterMul)) {
            throw new Error("Invalid letter multiplier");
        }

        const tile = new BoardTile(data._row, data._col);
        tile.type = data._type;
        tile.wordMultiplier = data._wordMul;
        tile.letterMultiplier = data._letterMul;

        if (data._tile !== null) 
        {
            tile.tile = Tile.fromJson(data._tile);
        } 
        else 
        {
            tile.tile = null;
        }

        return tile;
    }
}