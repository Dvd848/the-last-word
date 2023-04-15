import Bag from "./Bag.js";
import Tile from "./Tile.js";

export default class Player
{
    private name:           string;
    private max_tile_num:   number;
    private rack        :   Tile[];

    constructor(name: string, max_tile_num: number)
    {
        this.name = name;
        this.max_tile_num = max_tile_num;
        this.rack = [];
    }

    public fillRack(bag: Bag) : void
    {
        while ( (this.rack.length < this.max_tile_num) && (bag.length > 0) )
        {
            this.rack.push(bag.draw()!);
        }
    }
}