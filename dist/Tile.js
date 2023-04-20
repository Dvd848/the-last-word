let counter = 0;
export default class Tile {
    constructor(letter, points) {
        this._letter = letter;
        this._points = points;
        this._id = counter++;
    }
    get letter() {
        return this._letter;
    }
    get points() {
        return this._points;
    }
    get id() {
        return this._id;
    }
}
