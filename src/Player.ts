import Bag from "./Bag.js";
import Tile from "./Tile.js";

export default class Player
{
    private name:           string;
    private max_tile_num:   number;
    private _rack       :   Tile[];

    constructor(name: string, max_tile_num: number)
    {
        this.name = name;
        this.max_tile_num = max_tile_num;
        this._rack = [];
    }

    public fillRack(bag: Bag) : void
    {
        while ( (this._rack.length < this.max_tile_num) && (bag.length > 0) )
        {
            this._rack.push(bag.draw()!);
        }
    }

    get rack() : Tile[]
    {
        return [...this._rack];
    }
}