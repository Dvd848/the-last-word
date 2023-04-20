import Tile from "./Tile.js";
import { shuffle } from "./Utils.js";
import * as Constants from "./Constants.js";
export default class Bag {
    constructor(language) {
        this.tiles = [];
        const tileCounts = Constants.scrabbleTiles[language];
        for (const tileCount of tileCounts) {
            for (let i = tileCount.count; i > 0; i--) {
                this.tiles.push(new Tile(tileCount.letter, tileCount.points));
            }
        }
        this.tiles = shuffle(this.tiles);
    }
    draw() {
        if (this.tiles.length > 0) {
            return this.tiles.pop();
        }
        return null;
    }
    get length() {
        return this.tiles.length;
    }
}
