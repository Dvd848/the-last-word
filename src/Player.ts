export default class Player
{
    private name:           string;
    private max_tile_num:   number;

    constructor(name: string, max_tile_num: number)
    {
        this.name = name;
        this.max_tile_num = max_tile_num;
    }
}