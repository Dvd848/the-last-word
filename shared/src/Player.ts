import {Bag} from "./Bag";
import {TilePlacement, Tile} from "./Tile";
import {Board} from "./Board";

export enum PlayerType {
    Human           = "Human",
}

/**
 * Represents a Player
 */
export abstract class Player
{
    private     _name        :   string;
    private     _id          :   string;
    private     _index       :   number;
    private     maxTileNum   :   number;
    private     _rack        :   Set<Tile>;
    private     _points      :   number;
    private     _playerType  :   PlayerType;

    protected constructor(name: string, id: string, index: number, maxTileNum: number, playerType: PlayerType)
    {
        this._name = name;
        this._id = id;
        this._index = index;
        this.maxTileNum = maxTileNum;
        this._points = 0;
        this._rack = new Set<Tile>();
        this._playerType = playerType;
    }

    /**
     * Fill the rack with up to maxTileNum from the Bag
     * @param bag The bag to fill the rack from
     */
    public fillRack(bag: Bag) : void
    {
        while ( (this._rack.size < this.maxTileNum) && (bag.length > 0) )
        {
            this._rack.add(bag.draw()!);
        }
    }

    /**
     * Replace the current rack with the provided one
     * @param tiles The tiles to add to the rack
     */
    public setRack(tiles: Tile[]) : void
    {
        this._rack = new Set<Tile>();
        tiles.forEach((tile) => {
            this._rack.add(tile);
        });
    }

    /**
     * Remove the given tile from the rack
     * @param tile The tile to remove from the rack
     */
    public removeTile(tile: Tile) : void
    {
        for (const elem of this._rack) 
        {
            if (tile.equals(elem)) 
            {
                this._rack.delete(elem);
                return;
            }
        }
    }

    /**
     * Returns true if the player's rack contains the given tile
     * @param tile The tile to check 
     * @returns True if the player's rack contains the given tile
     */
    public hasTile(tile: Tile) : boolean
    {
        //return this._rack.has(tile);
        for (const elem of this._rack) 
        {
            if (tile.equals(elem)) 
            {
                return true;
            }
        }
        return false;
    }

    /**
     * Return a copy of the rack
     */
    get rack() : Tile[]
    {
        return [...this._rack];
    }

    /**
     * Return the player id
     */
    get id() : string
    {
        return this._id;
    }

    /**
     * Return the player index
     */
    get index() : number
    {
        return this._index;
    }

    /**
     * Return the player name
     */
    get name() : string
    {
        return this._name;
    }

    /**
     * Set the player name
     */
    set name(value: string)
    {
        this._name = value;
    }

    /**
     * Return the player points
     */
    get points() : number
    {
        return this._points;
    }

    /**
     * Set the player points
     */
    set points(value: number)
    {
        if (value < 0)
        {
            throw "Points must be non-negative";
        }

        this._points = value;
    }

    /**
     * Return the player type
     */
    get playerType() : PlayerType
    {
        return this._playerType;
    }

    /**
     * Get the player's move. Relevant only if automaticMode() == True, i.e. if it's not a human player
     * @param calculatePoints 
     */
    public abstract getMove(calculatePoints: (tilePlacements: TilePlacement[]) => number) : TilePlacement[];

    /**
     * Returns true if and only if this player performs moves automatically, i.e. it's not a human player
     */
    public abstract automaticMode() : boolean;

    /**
     * Factory method to create players.
     * @param name The player name
     * @param id The player number
     * @param maxTileNum The maximum number of tiles for the player rack
     * @param playerType The player type
     * @returns A new player
     */
    public static createPlayer(name: string, id: string, index: number, maxTileNum: number, playerType: PlayerType) : Player
    {
        switch(playerType)
        {
            case (PlayerType.Human):
                return new HumanPlayer(name, id, index, maxTileNum);
            default:
                throw new Error(`Unknown player type '${playerType}!`);
        }
    }

    public static fromJson(data: any): Player {
        switch (data._playerType) {
            case PlayerType.Human:
                return HumanPlayer.fromJson(data);
            default:
                throw new Error(`Unknown player type '${data._playerType}' in fromJson`);
        }
    }

    public static toJson(player: Player): any {
        return {
            _name: player.name,
            _id: player.id,
            _index : player.index,
            _points: player.points,
            maxTileNum: player['maxTileNum'],
            _playerType: player.playerType,
            _rack: Array.from(player._rack.values()).map(tile => ({
                _letter: tile.letter,
                _points: tile.points,
                _id: tile.id
            }))
        };
    }
}

export class HumanPlayer extends Player
{
    constructor(name: string, id: string, index: number, maxTileNum: number)
    {
        super(name, id, index, maxTileNum, PlayerType.Human);
    }

    public getMove(calculatePoints: (tilePlacements: TilePlacement[]) => number) : TilePlacement[]
    {
        throw new Error("Not implemented!");
    }

    public automaticMode() : boolean
    {
        return false;
    }

    static fromJson(data: any): HumanPlayer {
        const player = new HumanPlayer(data._name, data._id, data._index, data.maxTileNum);
        player.points = data._points;
        console.log(data._rack)
        const tiles = data._rack.map((tileJson: any) => Tile.fromJson(tileJson));
        player.setRack(tiles);
        return player;
    }
}

const enum Direction 
{
    ACROSS,
    DOWN
}
