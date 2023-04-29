
let counter = 0;

/**
 * Represents a game tile
 */
export default class Tile 
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
}