import BoardTile, {TileTypes} from './BoardTile'
import {Tile} from './Tile';
import * as Constants from "./Constants";

/**
 * Board class represents the game board.
 * This class allows viewing the tiles on the board but not modifying them.
 * @class
 */
export class Board 
{
    private   _size: number;
    protected tiles: BoardTile[][];
  
    /**
     * Constructs a new Board object with the specified size, and initializes the special tiles on the board.
     * @param size - The size of the board.
     */
    constructor(size: number, multipliers: Constants.TileMultipliers) 
    {
        this._size = size;
        this.tiles = new Array(size).fill(null).map(() => new Array(size).fill(null));
        for (let row = 0; row < size; row++) 
        {
            for (let col = 0; col < size; col++) 
            {
                this.tiles[row][col] = new BoardTile(row, col);
            }
        }

        Object.keys(multipliers).forEach((key, index) => {
            let type = key as keyof typeof multipliers;
            let wordMul = multipliers[type].wordMul;
            let letterMul = multipliers[type].letterMul;
            multipliers[type].coordinates.forEach((coordinates) => {
                this.tiles[coordinates.row][coordinates.col].type = type;
                this.tiles[coordinates.row][coordinates.col].wordMultiplier = wordMul;
                this.tiles[coordinates.row][coordinates.col].letterMultiplier = letterMul;
            })
        });
        
    }

    /**
     * Returns a BoardTile object at the specified row and column of the board.
     * @param row - The row of the board.
     * @param col - The column of the board.
     * @returns The BoardTile object at the specified row and column of the board.
     */
    getBoardTileType(row: number, col: number): TileTypes
    {
        return this.tiles[row][col].type;
    }

    /**
     * Returns a Tile object (or null if it's empty) at the specified row and column of the board.
     * @param row - The row of the board.
     * @param col - The column of the board.
     * @returns The Tile object or null at the specified row and column of the board.
     */
    getTile(row: number, col: number): Tile | null
    {
        return this.tiles[row][col].tile;
    }

    /**
     * Returns true if the tile at the specified row and column of the board is empty.
     * @param row - The row of the board.
     * @param col - The column of the board.
     * @returns True if the tile at the specified row and column of the board is empty.
     */
    isTileEmpty(row: number, col: number) : boolean
    {
        return (this.getTile(row, col) == null);
    }

    /**
     * Returns true if the location at the specified row and column of the board is within bounds of the board.
     * @param row - The row of the board.
     * @param col - The column of the board.
     * @returns True if the location at the specified row and column of the board is within bounds of the board.
     */
    isTileInBoard(row: number, col: number) : boolean
    {
        return (row >= 0 && col >= 0 && row < this.height && col < this.width);
    }

    /**
     * Returns the width of the board.
     * @returns The width of the board.
     */
    get width(): number
    {
        return this._size;
    }

    /**
     * Returns the height of the board.
     * @returns The height of the board.
     */
    get height(): number
    {
        return this._size;
    }

    static fromJson(data: any): Board {
        const board = new Board(data._size, {} as Constants.TileMultipliers);
        for (let row = 0; row < data.tiles.length; row++) {
            for (let col = 0; col < data.tiles[row].length; col++) {
                board.tiles[row][col] = BoardTile.fromJson(data.tiles[row][col]);
            }
        }
        return board;
    }

}

/**
 * ModifiableBoard class extends Board, allowing to modify tiles on the board.
 * @class
 */
export class ModifiableBoard extends Board
{
    constructor(size: number, multipliers: Constants.TileMultipliers) 
    {
        super(size, multipliers);
    }

    /**
     * Sets a tile at the specified row and column of the board.
     * @param row - The row of the board.
     * @param col - The column of the board.
     * @param tile - The tile to set at the specified row and column of the board, or null (to remove a tile).
     */
    setTile(row: number, col: number, tile: Tile | null): void 
    {
        this.tiles[row][col].tile = tile;
    }

    /**
     * Returns a BoardTile object at the specified row and column of the board.
     * @param row - The row of the board.
     * @param col - The column of the board.
     * @returns The BoardTile object at the specified row and column of the board.
     */
    getBoardTile(row: number, col: number): BoardTile
    {
        return this.tiles[row][col];
    }
}