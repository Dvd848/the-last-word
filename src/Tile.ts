
let counter = 0;

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
  
    get letter(): string 
    {
        return this._letter;
    }
  
    get points(): number 
    {
        return this._points;
    }

    get id(): number 
    {
        return this._id;
    }
}