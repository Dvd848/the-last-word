import Tile from "./Tile.js";
import { shuffle } from "./Utils.js";
import * as Constants from "./Constants.js";

export default class Bag 
{
    private tiles: Tile[] = [];
  
    constructor(language: Constants.Languages) 
    {
        const tileCounts = Constants.scrabbleTiles[language];
  
        for (const tileCount of tileCounts) 
        {
            for (let i = tileCount.count; i > 0; i--) 
            {
                this.tiles.push(new Tile(tileCount.letter, tileCount.points));
            }
        }

        this.tiles = shuffle(this.tiles);
    }

    public draw() : Tile | null
    {
        if (this.tiles.length > 0)
        {
            return this.tiles.pop()!;
        }

        return null;
    }

    get length() : number
    {
        return this.tiles.length;
    }
}