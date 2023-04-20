export default class Player {
    constructor(name, id, max_tile_num) {
        this._name = name;
        this._id = id;
        this.max_tile_num = max_tile_num;
        this._points = 0;
        this._rack = new Set();
    }
    fillRack(bag) {
        while ((this._rack.size < this.max_tile_num) && (bag.length > 0)) {
            this._rack.add(bag.draw());
        }
    }
    removeTile(tile) {
        this._rack.delete(tile);
    }
    get rack() {
        return [...this._rack];
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get points() {
        return this._points;
    }
    set points(value) {
        if (value < 0) {
            throw "Points must be non-negative";
        }
        this._points = value;
    }
}
