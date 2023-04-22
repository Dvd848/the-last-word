import Tile from "./Tile";
import { shuffle } from "./Utils";
import * as Constants from "./Constants";

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

        this.shuffle();
    }

    public draw() : Tile | null
    {
        if (this.tiles.length > 0)
        {
            return this.tiles.pop()!;
        }

        return null;
    }

    public add(tile: Tile) : void
    {
        this.tiles.push(tile);
    }

    public shuffle() : void 
    {
        this.tiles = shuffle(this.tiles);
    }

    get length() : number
    {
        return this.tiles.length;
    }
}