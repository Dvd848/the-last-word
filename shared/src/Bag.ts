import {Tile} from "./Tile";
import { shuffle } from "./Utils";
import {TileAttributes} from "./Constants"

/**
 * Bag class represents a bag of tiles.
 * @class
 */
export class Bag 
{
    private tiles: Tile[] = [];
    private tilesById: Map<number, Tile> = new Map<number, Tile>();
  
    /**
     * Creates an instance of Bag and shuffles it
     * @param tileCounts - An array describing the different tiles, their count and points
     */
    constructor(tileCounts: TileAttributes) 
    {  
        for (const tileCount of tileCounts) 
        {
            for (let i = tileCount.count; i > 0; i--) 
            {
                const tile = new Tile(tileCount.letter, tileCount.points);
                this.tiles.push(tile);
                this.tilesById.set(tile.id, tile);
            }
        }

        this.shuffle();
    }

    /**
     * Draws a tile from the bag.
     * @returns The drawn tile or null if the bag is empty.
     */
    public draw() : Tile | null
    {
        if (this.tiles.length > 0)
        {
            return this.tiles.pop()!;
        }

        return null;
    }

    /**
     * Adds a tile to the bag.
     * @param tile - The tile to add.
     */
    public add(tile: Tile) : void
    {
        this.tiles.push(tile);
    }

    /**
     * Shuffles the tiles in the bag.
     */
    public shuffle() : void 
    {
        this.tiles = shuffle(this.tiles);
    }

    /**
     * Gets the number of tiles in the bag.
     * @returns The number of tiles in the bag.
     */
    get length() : number
    {
        return this.tiles.length;
    }

    public getTileById(id: number) : Tile | null
    {
        const tile = this.tilesById.get(id);
        return tile !== undefined ? tile : null;
    }
}