let counter = 0;

export type TilePlacement =
{
    tile: Tile;
    r: number;
    c: number;
}

/**
 * Represents a game tile
 */
export class Tile 
{
    private readonly _letter: string;
    private readonly _points: number;
    private readonly _id    : number;
  
    constructor(letter: string, points: number) 
    {
        this._letter = letter;
        this._points = points;
        this._id     = counter++;
    }
  
    /**
     * Returns the letter for this tile.
     * @returns The letter on the tile.
     */
    get letter(): string 
    {
        return this._letter;
    }
  
    /**
     * Returns the points for this tile.
     * @returns The points value of the tile.
     */
    get points(): number 
    {
        return this._points;
    }

    /**
     * Returns the tile ID.
     * @returns The unique ID of the tile.
     */
    get id(): number 
    {
        return this._id;
    }

    /**
     * Checks if this tile is equal to another tile.
     * Equality is based on letter, points, and id.
     * @param other Other tile to compare.
     * @returns True if the tiles are equal, false otherwise.
     */
    public equals(other: Tile) : boolean 
    { 
        return (
            (this.letter == other.letter)
            && (this.points == other.points)
            && (this.id == other.id)
        );
    }

    /**
     * Creates a Tile instance from a JSON object.
     * @param data The JSON data representing the tile.
     * @returns A Tile instance.
     */
    static fromJson(data: any): Tile 
    {
        const tile = new Tile(data._letter, data._points);
        (tile as any)._id = data._id;
        //counter = Math.max(counter, data._id + 1); // Ensure no duplicate IDs
        return tile;
    }
}