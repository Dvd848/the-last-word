//import BoardTile from './BoardTile.js'
import Tile from './Tile.js';

export default class Board 
{
    private _size: number;
    private tiles: (Tile | null)[][];
  
    constructor(size: number) 
    {
        this._size = size;
        this.tiles = new Array(size).fill(null).map(() => new Array(size).fill(null));
    }
  
    getTile(row: number, col: number): Tile | null
    {
        return this.tiles[row][col];
    }

    setTile(row: number, col: number, tile: Tile | null): void 
    {
        this.tiles[row][col] = tile;
    }

    isTileEmpty(row: number, col: number) : boolean
    {
        return (this.getTile(row, col) == null);
    }

    isTileInBoard(row: number, col: number) : boolean
    {
        return (row >= 0 && col >= 0 && row < this.height && col < this.width);
    }

    get width(): number
    {
        return this._size;
    }

    get height(): number
    {
        return this._size;
    }

}