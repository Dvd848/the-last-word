import { PlayerType } from "./Player";
import { Tile } from "./Tile";

export type PlayerDetails = 
{
    id          : string,
    name        : string,
    playerType  : PlayerType
}

export enum GameErrorTypes {
    PlacementConsecutive,
    PlacementConnected,
    PlacementExisting,
    PlacementIllegalWord,
    PlacementFirstWordMin,
    PlacementFirstWordLocation,
    UserDoesNotHaveTile
}

/**
 * Represents an error caused by a user action in the game.
 * Contains the error type and any extra data relevant to the error.
 */
export class UserError extends Error 
{
    public extraData : any;
    public type : GameErrorTypes;
    constructor(type: GameErrorTypes, extraData: any = null) 
    {
        super(`The following error occurred: ${type.toString()}`);
        this.extraData = extraData;
        this.type = type;
    }
}

export type WordInfo = 
{
    word: string;
    startIndex: { x: number, y: number };
    points: number;
}

export type MoveDetails = 
{
    playerIndex: number;
    points: number, 
    placedWords: WordInfo[], 
    bonusPoints: number
}

export type SwapDetails = 
{
    playerIndex: number;
    oldTiles: Tile[]
}