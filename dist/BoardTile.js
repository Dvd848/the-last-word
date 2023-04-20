import * as Constants from "./Constants.js";
export default class BoardTile {
    constructor(row, col) {
        this._row = row;
        this._col = col;
        this._tile = null;
        this._type = Constants.TileTypes.Regular;
        this._wordMul = 1;
        this._letterMul = 1;
    }
    get row() {
        return this._row;
    }
    get col() {
        return this._col;
    }
    get tile() {
        return this._tile;
    }
    set tile(tile) {
        this._tile = tile;
    }
    get type() {
        return this._type;
    }
    set type(type) {
        this._type = type;
    }
    get wordMultiplier() {
        return this._wordMul;
    }
    set wordMultiplier(value) {
        this._wordMul = value;
    }
    get letterMultiplier() {
        return this._letterMul;
    }
    set letterMultiplier(value) {
        this._letterMul = value;
    }
    disableMultiplier() {
        this._wordMul = 1;
        this._letterMul = 1;
    }
}
