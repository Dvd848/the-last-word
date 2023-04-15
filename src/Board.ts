import BoardTile from './BoardTile.js'

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
    }
  
    getTile(row: number, col: number): BoardTile 
    {
        return this.tiles[row][col];
    }

    get size(): number
    {
        return this._size;
    }

}