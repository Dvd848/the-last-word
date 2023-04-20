import BoardTile from './BoardTile.js';
import * as Constants from "./Constants.js";
export default class Board {
    constructor(size) {
        this._size = size;
        this.tiles = new Array(size).fill(null).map(() => new Array(size).fill(null));
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                this.tiles[row][col] = new BoardTile(row, col);
            }
        }
        Object.keys(Constants.tileMultipliers).forEach((key, index) => {
            let type = key;
            let wordMul = Constants.tileMultipliers[type].wordMul;
            let letterMul = Constants.tileMultipliers[type].letterMul;
            Constants.tileMultipliers[type].coordinates.forEach((coordinates) => {
                this.tiles[coordinates.row][coordinates.col].type = type;
                this.tiles[coordinates.row][coordinates.col].wordMultiplier = wordMul;
                this.tiles[coordinates.row][coordinates.col].letterMultiplier = letterMul;
            });
        });
    }
    getBoardTile(row, col) {
        return this.tiles[row][col];
    }
    getTile(row, col) {
        return this.tiles[row][col].tile;
    }
    setTile(row, col, tile) {
        this.tiles[row][col].tile = tile;
    }
    isTileEmpty(row, col) {
        return (this.getTile(row, col) == null);
    }
    isTileInBoard(row, col) {
        return (row >= 0 && col >= 0 && row < this.height && col < this.width);
    }
    get width() {
        return this._size;
    }
    get height() {
        return this._size;
    }
}
