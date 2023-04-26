import * as Constants from './Constants';
import {ModifiableBoard, Board} from './Board'
import {Player, PlayerType} from './Player';
import Bag from './Bag';
import Tile from './Tile';
import { Display } from './Display';
import Dictionary from './Dictionary';
import * as Utils from './Utils';

export type WordInfo = {
    word: string;
    startIndex: { x: number, y: number };
    points: number;
}

export type TilePlacement =
{
    tile: Tile;
    r: number;
    c: number;
}

export type GameConfiguration = 
{
    playerDetails: PlayerDetails[];
    checkDict: boolean;
}

export type PlayerDetails = 
{
    name        : string,
    playerType  : PlayerType
}

class UserError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export default class Game 
{
    private board!              : ModifiableBoard;
    private players!            : Player[];
    private currentPlayerIndex! : number;
    private bag!                : Bag;
    private display!            : Display;
    private firstTurnPlayed!    : boolean;
    private dictionary!         : Dictionary;
    private checkDict!          : boolean;
    private consecutivePasses!  : number;
    private isGameOver!           : boolean;
  
    constructor(gameConfiguration: GameConfiguration, dictionary: Dictionary) 
    {
        this.dictionary = dictionary;

        const that = this;
        this.display = new Display({
            endTurn: function(tilePlacements: TilePlacement[]){that.endTurnCallback(tilePlacements);},
            getConfiguration: function(){return that.getConfiguration();},
            setConfiguration: function(config: GameConfiguration){that.setConfigurationCallback(config);},
            swapTiles: function(tiles: Tile[]){that.swapTilesCallback(tiles);},
            getNumTilesInBag: function(){return that.bag.length;},
            newGame: function(){that.newGame(that.getConfiguration())}
        });

        this.newGame(gameConfiguration);
    }

    public newGame(gameConfiguration: GameConfiguration) : void
    {
        this.board = new ModifiableBoard(Constants.BOARD_DIMENSIONS);
        this.currentPlayerIndex = 0;
        this.bag = new Bag(Constants.DefaultLanguage);
        this.firstTurnPlayed = false;
        this.checkDict = gameConfiguration.checkDict;
        this.consecutivePasses = 0;
        this.display.init(this.board);
        this.isGameOver = false;
        
        this.players = this.createPlayers(gameConfiguration.playerDetails, false);

        this.players.forEach((player) => {
            player.fillRack(this.bag);
            this.display.displayPlayerInfo(player);
        });

        this.display.setPlayerNames(this.players);

        this.currentPlayerIndex = this.players.length - 1;
        this.moveToNextPlayer();
        
        this.display.show();
    }

    private createPlayers(players: PlayerDetails[], basedOnCurrent: boolean) : Player[]
    {
        if (this.players && (players.length != this.players.length))
        {
            throw new Error("Can't change number of players");
        }

        const newPlayers : Player[] = [];
        players.forEach((player, index) => {
            const newPlayer = Player.createPlayer(player.name, index + 1, Constants.TILES_PER_PLAYER, 
                this.dictionary, this.board, player.playerType);
            if (basedOnCurrent && this.players)
            {
                newPlayer.points = this.players[index].points;
                newPlayer.setRack(this.players[index].rack);
            }
            newPlayers.push(newPlayer);
        });

        return newPlayers;
    }

    public getConfiguration() : GameConfiguration
    {
        return {
            playerDetails: this.players.map(player => {return {name: player.name, playerType: player.playerType}}),
            checkDict: this.checkDict
        }
    }

    private setConfigurationCallback(config: GameConfiguration) : boolean
    {
        try
        {

            if (config.playerDetails.length != this.players.length)
            {
                throw Error("Number of player names should match number of players");
            }
    
            config.playerDetails.forEach((details) => {
                details.name = details.name.trim();
                if (details.name == "")
                {
                    throw Error("Player name can't be empty or only spaces");
                }
            });
    
            this.checkDict = config.checkDict;
            this.players = this.createPlayers(config.playerDetails, true);
        
            this.display.setPlayerNames(this.players);

            this.playAutoTurnIfNeeded();
    
            return true;
        }
        catch (err)
        {
            return false;
        }
    }

    private swapTilesCallback(tiles: Tile[]) : void
    {
        if (tiles.length > this.currentPlayer.rack.length)
        {
            return;
        }

        const numTiles = Math.min(tiles.length, this.bag.length);
        
        const oldTiles : Tile[] = [];
        for (let i = 0; i < numTiles; i++)
        {
            this.currentPlayer.removeTile(tiles[i]);
            oldTiles.push(tiles[i]);
        }
        this.currentPlayer.fillRack(this.bag);

        oldTiles.forEach((tile) => {
            this.bag.add(tile);
        })

        this.bag.shuffle();

        this.display.logSwap(this.currentPlayer, oldTiles);

        this.consecutivePasses += 1;

        this.moveToNextPlayer();
    }

    private getCreatedWords(tilePlacements: TilePlacement[]): WordInfo[] 
    {
        const words = new Set<string>();
        const axes = ["r", "c"];

        for (const placement of tilePlacements) {
            for (let axis of axes)
            {
                let word = "";
                let points = 0;
                let start_index = { r: -1, c: -1 };
                
                // Scan vertically up
                let current = {r: placement.r, c: placement.c};
                while (this.board.isTileInBoard(current["r"], current["c"]) && !this.board.isTileEmpty(current["r"], current["c"])) 
                {
                    start_index = { r: current["r"], c: current["c"] };
                    current[axis as keyof typeof current]--;
                }
                
                // Reset to starting tile
                current["r"] = start_index.r;
                current["c"] = start_index.c;
                
                // Scan vertically down
                let wordMultiplier = 1;

                while (this.board.isTileInBoard(current["r"], current["c"]) && !this.board.isTileEmpty(current["r"], current["c"])) 
                {
                    let tile = this.board.getTile(current["r"], current["c"])!;
                    let boardTile = this.board.getBoardTile(current["r"], current["c"])!;

                    word += tile.letter;
                    points += (tile.points * boardTile.letterMultiplier);
                    current[axis as keyof typeof current]++;
                    wordMultiplier *= boardTile.wordMultiplier;
                }

                points *= wordMultiplier;
                
                if (word.length > 1) 
                {
                    // Use JSON.stringify to maintain the set property
                    words.add(JSON.stringify({ word, start_index: start_index, points: points }));
                }
            }
        }
        
        return Array.from(words, (JSONEntry) => JSON.parse(JSONEntry));
    }

    private calculatePoints(tilePlacements: TilePlacement[], placedWords: WordInfo[]) : [number, number]
    {
        let newPoints = 0;
        let bonusPoints = 0;

        for (const placedWord of placedWords) 
        {
            newPoints += placedWord.points;
        }
        if (tilePlacements.length == Constants.TILES_PER_PLAYER)
        {
            bonusPoints = Constants.BINGO_BONUS_POINTS;
        }

        return [newPoints, bonusPoints];
    }

    private verifyPlacementConsecutive(tilePlacements: TilePlacement[]) : boolean
    {
        if (tilePlacements.length > 0)
        {
            const rValues = tilePlacements.map((tilePlacement) => tilePlacement.r);
            const cValues = tilePlacements.map((tilePlacement) => tilePlacement.c);
            
            const rSet = new Set(rValues);
            const cSet = new Set(cValues);
            
            let axis: keyof TilePlacement;
            if (rSet.size === 1)
            {
                // All the tiles are placed in the same row
                axis = "c" as keyof TilePlacement;
            }
            else if (cSet.size === 1)
            {
                // All the tiles are placed in the same column
                axis = "r" as keyof TilePlacement;
            }
            else
            {
                return false;
            }

            // Search for the minimum and maximum value for the non-constant axis
            const minMax = tilePlacements.reduce((acc, curr) => {
                let n : number = curr[axis] as number;
                return [
                    Math.min(acc[0], n),
                    Math.max(acc[1], n)
                ];
            }, [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]);

            // Check that the tiles are consecutive
            if (rSet.size === 1)
            {
                for (let c = minMax[0]; c <= minMax[1]; c++)
                {
                    if (this.board.isTileEmpty(rValues[0], c) && !cSet.has(c))
                    {
                        return false;
                    }
                }
            }
            else if (cSet.size === 1)
            {
                for (let r = minMax[0]; r <= minMax[1]; r++)
                {
                    if (this.board.isTileEmpty(r, cValues[0]) && !rSet.has(r))
                    {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private verifyPlacementConnected(tilePlacements: TilePlacement[]) : boolean
    {
        if (this.firstTurnPlayed && tilePlacements.length > 0)
        {
            let connected = false;
            for (const tilePlacement of tilePlacements) 
            {
                for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
                {
                    let new_r = tilePlacement.r + dr;
                    let new_c = tilePlacement.c + dc;
                    if (this.board.isTileInBoard(new_r, new_c) && !this.board.isTileEmpty(new_r, new_c))
                    {
                        connected = true;
                        break;
                    }
                }
            }

            if (!connected) 
            {
                return false;
            }
        }
        return true;
    }

    private playAutoTurnIfNeeded() : void
    {
        if (!this.isGameOver)
        {
            if (this.currentPlayer.automaticMode())
            {
                this.display.toggleEndTurnButton(true);
                const that = this;
                setTimeout(function(){
                    let tilePlacements: TilePlacement[] = that.currentPlayer.getMove();
                    tilePlacements.forEach((tilePlacement) => {
                        that.display.setTile(tilePlacement.r, tilePlacement.c, tilePlacement.tile);
                    });
                    that.endTurnCallback(tilePlacements);
                }, 10);
            }
            else
            {
                this.display.toggleEndTurnButton(false);
            }
        }
    }

    private moveToNextPlayer() : void
    {
        this.display.displayPlayerInfo(this.currentPlayer);
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.display.setActivePlayer(this.currentPlayer);

        this.playAutoTurnIfNeeded();
    }

    private endTurnCallback(tilePlacements: TilePlacement[]) : void
    {
        const actualTilePlacements : TilePlacement[] = [];

        const getError = (id: Constants.Strings) => {
            return Utils.getTranslation(Constants.DefaultLanguage, id);
        };

        try
        {
            if (!this.verifyPlacementConsecutive(tilePlacements))
            {
                throw new UserError(getError(Constants.Strings.ErrorConsecutive));
            }

            if (!this.verifyPlacementConnected(tilePlacements))
            {
                throw new UserError(getError(Constants.Strings.ErrorConnected));
            }

            for (const tilePlacement of tilePlacements) 
            {
                if (!this.board.isTileEmpty(tilePlacement.r, tilePlacement.c)) 
                {
                    throw new UserError(getError(Constants.Strings.ErrorExisting));
                }

                // Mark the placed tile as placed
                this.board.setTile(tilePlacement.r, tilePlacement.c, tilePlacement.tile);
                actualTilePlacements.push(tilePlacement);
            }

            const placedWords: WordInfo[] = this.getCreatedWords(tilePlacements);

            // Check if all placedWords are valid words
            if (this.checkDict)
            {
                for (const placedWord of placedWords) 
                {
                    if (!this.dictionary.contains(placedWord.word))
                    {
                        throw new UserError(getError(Constants.Strings.ErrorIllegalWord).replace("${word}", placedWord.word));
                    }
                }
            }

            if (!this.firstTurnPlayed)
            {
                if (tilePlacements.length == 1)
                {
                    throw new UserError(getError(Constants.Strings.ErrorFirstWordMin));
                }
                else if (tilePlacements.length > 0)
                {
                    let centerTileUsed = false;

                    tilePlacements.forEach((tilePlacement) => {
                        if ( (tilePlacement.r == Constants.CENTER_TILE_ROW) && (tilePlacement.c == Constants.CENTER_TILE_COL) ) 
                        {
                            centerTileUsed = true;
                        }
                    });

                    if (!centerTileUsed)
                    {
                        throw new UserError(getError(Constants.Strings.ErrorFirstWordLocation));
                    }

                    this.firstTurnPlayed = true;
                }
            }
            
            // All checks passed, move is good

            let [newPoints, bonusPoints] = this.calculatePoints(tilePlacements, placedWords);
            this.currentPlayer.points += newPoints + bonusPoints;
            
            tilePlacements.forEach((tilePlacement) => {
                this.currentPlayer.removeTile(tilePlacement.tile);
                this.board.getBoardTile(tilePlacement.r, tilePlacement.c).disableMultiplier();
            });

            this.display.finalizePlacements();

            this.display.logMoveDetails(this.currentPlayer, newPoints, placedWords, bonusPoints);

            this.currentPlayer.fillRack(this.bag);

            if (tilePlacements.length == 0)
            {
                this.consecutivePasses += 1;
            }
            else
            {
                this.consecutivePasses = 0;
            }

            if ( (this.currentPlayer.rack.length == 0) || (this.consecutivePasses == Constants.MAX_CONSECUTIVE_PASS) )
            {
                this.display.displayPlayerInfo(this.currentPlayer);
                this.display.gameOver(this.getLeadingPlayer());
                this.isGameOver = true;
            }
            else
            {
                this.moveToNextPlayer();
            }

        }
        catch(err) 
        {
            if (err instanceof UserError) 
            {
                this.display.showError(err.message);
            }
            else if (err instanceof Error)
            {
                console.log(err.message);
            }
            else
            {
                console.log(err);
            }
            actualTilePlacements.forEach((tilePlacement) => {
                this.board.setTile(tilePlacement.r, tilePlacement.c, null);
            });
        }
    }

    private getLeadingPlayer() : Player | null
    {
        let res = this.players[0];
        let tie = true;
        this.players.forEach((player) => {
            if (player.points > res.points)
            {
                res = player;
                tie = false;
            }
            else if (player.points < res.points)
            {
                tie = false;
            }
        });

        if (tie)
        {
            return null;
        }
        return res;
    }
    
    private get currentPlayer(): Player 
    {
        return this.players[this.currentPlayerIndex];
    }
}
