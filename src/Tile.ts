export default class Tile 
{
    private readonly _letter: string;
    private readonly _points: number;
  
    constructor(letter: string, points: number) 
    {
        this._letter = letter;
        this._points = points;
    }
  
    get letter(): string 
    {
        return this._letter;
    }
  
    get points(): number 
    {
        return this._points;
    }
}