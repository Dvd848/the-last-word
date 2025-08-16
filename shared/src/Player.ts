import {Bag} from "./Bag";
import {TilePlacement, Tile} from "./Tile";

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
    private     _maxTileNum  :   number;
    private     _rack        :   Set<Tile>;
    private     _points      :   number;
    private     _playerType  :   PlayerType;

    protected constructor(name: string, id: string, index: number, maxTileNum: number, playerType: PlayerType)
    {
        this._name = name;
        this._id = id;
        this._index = index;
        this._maxTileNum = maxTileNum;
        this._points = 0;
        this._rack = new Set<Tile>();
        this._playerType = playerType;
    }

    /**
     * Fill the rack with up to maxTileNum from the Bag.
     * Draws tiles from the bag until the rack is full or the bag is empty.
     * @param bag The bag to fill the rack from.
     */
    public fillRack(bag: Bag) : void
    {
        while ( (this._rack.size < this._maxTileNum) && (bag.length > 0) )
        {
            this._rack.add(bag.draw()!);
        }
    }

    /**
     * Replace the current rack with the provided one.
     * @param tiles The tiles to add to the rack.
     */
    public setRack(tiles: Tile[]) : void
    {
        this._rack = new Set<Tile>();
        tiles.forEach((tile) => {
            this._rack.add(tile);
        });
    }

    /**
     * Remove the given tile from the rack.
     * @param tile The tile to remove from the rack.
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
     * Returns true if the player's rack contains the given tile.
     * @param tile The tile to check.
     * @returns True if the player's rack contains the given tile.
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
     * Return a copy of the rack.
     * @returns An array of tiles in the rack.
     */
    get rack() : Tile[]
    {
        return [...this._rack];
    }

    /**
     * Return the player id.
     * @returns The player's id.
     */
    get id() : string
    {
        return this._id;
    }

    /**
     * Return the player index.
     * @returns The player's index.
     */
    get index() : number
    {
        return this._index;
    }

    /**
     * Return the player name.
     * @returns The player's name.
     */
    get name() : string
    {
        return this._name;
    }

    /**
     * Set the player name.
     * @param value The new name for the player.
     */
    set name(value: string)
    {
        this._name = value;
    }

    /**
     * Return the player points.
     * @returns The player's points.
     */
    get points() : number
    {
        return this._points;
    }

    /**
     * Set the player points.
     * Throws if value is negative.
     * @param value The new points value.
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
     * Return the player type.
     * @returns The player's type.
     */
    get playerType() : PlayerType
    {
        return this._playerType;
    }

    /**
     * Return the maximum number of tiles allowed in the player's rack.
     * @returns The maximum number of tiles.
     */
    get maxTileNum() : number
    {
        return this._maxTileNum;
    }

    /**
     * Get the player's move. Relevant only if automaticMode() == True, i.e. if it's not a human player.
     * @param calculatePoints Function to calculate points for a move.
     * @returns Array of TilePlacement representing the move.
     */
    public abstract getMove(calculatePoints: (tilePlacements: TilePlacement[]) => number) : TilePlacement[];

    /**
     * Returns true if and only if this player performs moves automatically, i.e. it's not a human player.
     * @returns True if automatic, false otherwise.
     */
    public abstract automaticMode() : boolean;

    /**
     * Factory method to create players.
     * @param name The player name.
     * @param id The player id.
     * @param index The player index.
     * @param maxTileNum The maximum number of tiles for the player rack.
     * @param playerType The player type.
     * @returns A new player.
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

    /**
     * Creates a Player instance from a JSON object.
     * @param data The JSON data representing the player.
     * @returns A Player instance.
     */
    public static fromJson(data: any): Player 
    {
        switch (data._playerType) 
        {
            case PlayerType.Human:
                return HumanPlayer.fromJson(data);
            default:
                throw new Error(`Unknown player type '${data._playerType}' in fromJson`);
        }
    }

    /**
     * Converts a Player instance to a JSON object.
     * @param player The Player instance.
     * @returns The JSON representation of the player.
     */
    public static toJson(player: Player): any 
    {
        return {
            _name: player.name,
            _id: player.id,
            _index : player.index,
            _points: player.points,
            _maxTileNum: player.maxTileNum,
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
    /**
     * Constructs a HumanPlayer instance.
     * @param name The player name.
     * @param id The player id.
     * @param index The player index.
     * @param maxTileNum The maximum number of tiles for the player rack.
     */
    constructor(name: string, id: string, index: number, maxTileNum: number)
    {
        super(name, id, index, maxTileNum, PlayerType.Human);
    }

    /**
     * Throws an error because human players do not implement automatic moves.
     */
    public getMove(calculatePoints: (tilePlacements: TilePlacement[]) => number) : TilePlacement[]
    {
        throw new Error("Not implemented!");
    }

    /**
     * Returns false because human players do not perform moves automatically.
     * @returns False.
     */
    public automaticMode() : boolean
    {
        return false;
    }

    /**
     * Creates a HumanPlayer instance from a JSON object.
     * @param data The JSON data representing the player.
     * @returns A HumanPlayer instance.
     */
    static fromJson(data: any): HumanPlayer {
        // Validate required fields
        if (typeof data._name !== "string" || typeof data._id !== "string" ||
            typeof data._index !== "number" || typeof data._maxTileNum !== "number" ||
            typeof data._points !== "number" || !Array.isArray(data._rack)) {
            throw new Error("Invalid HumanPlayer data");
        }
        const player = new HumanPlayer(data._name, data._id, data._index, data._maxTileNum);
        player.points = data._points;
        const tiles = data._rack.map((tileJson: any) => Tile.fromJson(tileJson));
        player.setRack(tiles);
        return player;
    }
}
