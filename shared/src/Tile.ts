
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
     * Returns the letter for this tile
     */
    get letter(): string 
    {
        return this._letter;
    }
  
    /**
     * Returns the points for this tile
     */
    get points(): number 
    {
        return this._points;
    }

    /**
     * Returns the tile ID
     */
    get id(): number 
    {
        return this._id;
    }

    /**
     * Is this tile equal to another tile?
     * @param other Other tile
     * @returns True if the tiles are equal, false otherwise
     */
    public equals(other: Tile) : boolean { 
        return (
            (this.letter == other.letter)
            && (this.points == other.points)
            && (this.id == other.id)
        );
    }

    static fromJson(data: any): Tile {
        const tile = new Tile(data._letter, data._points);
        (tile as any)._id = data._id;
        //counter = Math.max(counter, data._id + 1); // Ensure no duplicate IDs
        return tile;
    }
}