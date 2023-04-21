import BoardTile from './BoardTile'
import Tile from './Tile';
import * as Constants from "./Constants";

export default class Board 
{
    private _size: number;
    private tiles: BoardTile[][];
  
    constructor(size: number) 
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

        Object.keys(Constants.tileMultipliers).forEach((key, index) => {
            let type = key as keyof typeof Constants.tileMultipliers;
            let wordMul = Constants.tileMultipliers[type].wordMul;
            let letterMul = Constants.tileMultipliers[type].letterMul;
            Constants.tileMultipliers[type].coordinates.forEach((coordinates) => {
                this.tiles[coordinates.row][coordinates.col].type = type;
                this.tiles[coordinates.row][coordinates.col].wordMultiplier = wordMul;
                this.tiles[coordinates.row][coordinates.col].letterMultiplier = letterMul;
            })
        });
        
    }
  
    getBoardTile(row: number, col: number): BoardTile
    {
        return this.tiles[row][col];
    }

    getTile(row: number, col: number): Tile | null
    {
        return this.tiles[row][col].tile;
    }

    setTile(row: number, col: number, tile: Tile | null): void 
    {
        this.tiles[row][col].tile = tile;
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