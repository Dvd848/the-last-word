import Bag from "./Bag.js";
import Tile from "./Tile.js";

export default class Player
{
    private _name        :   string;
    private _id          :   number;
    private max_tile_num :   number;
    private _rack        :   Set<Tile>;
    private _points      :   number;

    constructor(name: string, id: number, max_tile_num: number)
    {
        this._name = name;
        this._id = id;
        this.max_tile_num = max_tile_num;
        this._points = 0;
        this._rack = new Set<Tile>();
    }

    public fillRack(bag: Bag) : void
    {
        while ( (this._rack.size < this.max_tile_num) && (bag.length > 0) )
        {
            this._rack.add(bag.draw()!);
        }
    }

    public removeTile(tile: Tile) : void
    {
        this._rack.delete(tile);
    }

    get rack() : Tile[]
    {
        return [...this._rack];
    }

    get id() : number
    {
        return this._id;
    }

    get name() : string
    {
        return this._name;
    }

    get points() : number
    {
        return this._points;
    }

    set points(value: number)
    {
        if (value < 0)
        {
            throw "Can't reduce player points";
        }

        this._points = value;
    }
}