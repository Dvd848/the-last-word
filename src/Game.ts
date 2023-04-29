import * as Constants from './Constants';
import {ModifiableBoard, Board} from './Board'
import {Player, PlayerType} from './Player';
import Bag from './Bag';
import Tile from './Tile';
import { Display } from './Display';
import Dictionary from './Dictionary';
import { DefaultLanguage } from './Strings';

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

export enum GameErrorTypes {
    PlacementConsecutive,
    PlacementConnected,
    PlacementExisting,
    PlacementIllegalWord,
    PlacementFirstWordMin,
    PlacementFirstWordLocation
}

class UserError extends Error {
    public extraData : any;
    public type : GameErrorTypes;
    constructor(type: GameErrorTypes, extraData: any = null) 
    {
        super(`The following error occurred: ${type.toString()}`);
        this.extraData = extraData;
        this.type = type;
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
            endTurn: function(tilePlacements: TilePlacement[], forceObjection: boolean){that.endTurnCallback(tilePlacements, forceObjection);},
            getConfiguration: function(){return that.getConfiguration();},
            setConfiguration: function(config: GameConfiguration){that.setConfigurationCallback(config);},
            swapTiles: function(tiles: Tile[]){that.swapTilesCallback(tiles);},
            getNumTilesInBag: function(){return that.bag.length;},
            newGame: function(){that.newGame(that.getConfiguration())},
            checkWord: function(word: string) {return that.checkWordCallback(word);}
        });

        this.newGame(gameConfiguration);
    }

    /**
     * Starts a new game based on the given configuration
     * @param gameConfiguration The game configuration for the game
     */
    public newGame(gameConfiguration: GameConfiguration) : void
    {
        this.board = new ModifiableBoard(Constants.BOARD_DIMENSIONS, Constants.tileMultipliers);
        this.currentPlayerIndex = 0;
        this.bag = new Bag(Constants.gameTiles[DefaultLanguage]);
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

    /**
     * Create the players for the game
     * @param players The player details to use for creating the players
     * @param basedOnCurrent True if the new players should inherit the rack and points from the current players, False otherwise
     * @returns The new players created
     */
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

    /**
     * Return the current game configuration
     * @returns The current game configuration
     */
    public getConfiguration() : GameConfiguration
    {
        return {
            playerDetails: this.players.map(player => {return {name: player.name, playerType: player.playerType}}),
            checkDict: this.checkDict
        }
    }

    /**
     * Set the current game configuration
     * @param config The configuration to be used
     * @returns True if the configuration was legal, False otherwise
     */
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

    /**
     * Callback for the Display to check if a given word exists in the dictionary
     * @param word The word to check
     * @returns True if the word exists in the dictionary, False otherwise
     */
    private checkWordCallback(word: string) : boolean
    {
        return this.dictionary.contains(word);
    }

    /**
     * Callback for the Display to swap tiles for the current player
     * @param tiles The tiles to swap
     */
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

    /**
     * Given a tile placement, return all the word (and points) for the words created as part of this placement
     * @param tilePlacements An array representing the tiles placed on the board
     * @returns The different words (and their matching points) created as part of this placement
     */
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

    /**
     * Calculate the amount of points the player is entitled to as part of the given placement
     * @param tilePlacements An array representing the tiles placed on the board 
     * @param placedWords An array representing the words created as part of this placement
     * @returns A tuple with the amount of points for the word placement and the amount of bonus points for this placement
     */
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

    /**
     * Verify that the given tiles were placed in a consecutive manner
     * @param tilePlacements An array representing the tiles placed on the board 
     * @returns True if the tiles were placed consecutively on the board
     */
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

    /**
     * Verify that all the tiles placed during this turn are connected legally
     * @param tilePlacements An array representing the tiles placed on the board 
     * @returns True if all the tiles are connected legally
     */
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

    /**
     * If the current place is a computer, play their turn
     */
    private playAutoTurnIfNeeded() : void
    {
        if (!this.isGameOver)
        {
            if (this.currentPlayer.automaticMode())
            {
                const calcPoints = (tilePlacements: TilePlacement[]) => {
                    return this.calculatePointsForPlayerMove(tilePlacements);
                }
                this.display.toggleEndTurnButton(true);
                const that = this;
                setTimeout(function(){
                    let tilePlacements: TilePlacement[] = that.currentPlayer.getMove(calcPoints);
                    tilePlacements.forEach((tilePlacement) => {
                        that.display.setTile(tilePlacement.r, tilePlacement.c, tilePlacement.tile);
                    });
                    that.endTurnCallback(tilePlacements, false);
                }, 10);
            }
            else
            {
                this.display.toggleEndTurnButton(false);
            }
        }
    }

    /**
     * Move to the next player after the current player ended their turn
     */
    private moveToNextPlayer() : void
    {
        this.display.displayPlayerInfo(this.currentPlayer);
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.display.setActivePlayer(this.currentPlayer);

        this.playAutoTurnIfNeeded();
    }

    /**
     * Callback function to allow a (computer) player to get the number of points for a theoretical placement.
     * @param tilePlacements An array representing the tiles to be placed on the board 
     * @returns The amount of points for the given placement
     */
    private calculatePointsForPlayerMove(tilePlacements: TilePlacement[]) : number
    {
        try
        {
            tilePlacements.forEach((tilePlacement) => {
                this.board.setTile(tilePlacement.r, tilePlacement.c, tilePlacement.tile);
            });
            const placedWords: WordInfo[] = this.getCreatedWords(tilePlacements);
            let [newPoints, bonusPoints] = this.calculatePoints(tilePlacements, placedWords);
            return newPoints + bonusPoints;
        }
        catch (err)
        {
            console.log(err);
        }
        finally
        {
            tilePlacements.forEach((tilePlacement) => {
                this.board.setTile(tilePlacement.r, tilePlacement.c, null);
            });
        }

        return 0;
    }

    /**
     * Callback for the Display to handle the end of a turn
     * @param tilePlacements An array representing the tiles placed on the board 
     * @param forceObjection True if the user requests to override the dictionary check
     */
    private endTurnCallback(tilePlacements: TilePlacement[], forceObjection: boolean) : void
    {
        const actualTilePlacements : TilePlacement[] = [];

        try
        {
            if (!this.verifyPlacementConsecutive(tilePlacements))
            {
                throw new UserError(GameErrorTypes.PlacementConsecutive);
            }

            if (!this.verifyPlacementConnected(tilePlacements))
            {
                throw new UserError(GameErrorTypes.PlacementConnected);
            }

            for (const tilePlacement of tilePlacements) 
            {
                if (!this.board.isTileEmpty(tilePlacement.r, tilePlacement.c)) 
                {
                    throw new UserError(GameErrorTypes.PlacementExisting);
                }

                // Mark the placed tile as placed
                this.board.setTile(tilePlacement.r, tilePlacement.c, tilePlacement.tile);
                actualTilePlacements.push(tilePlacement);
            }

            const placedWords: WordInfo[] = this.getCreatedWords(tilePlacements);

            // Check if all placedWords are valid words
            const illegalWords : string[] = [];
            if (this.checkDict && !forceObjection)
            {
                for (const placedWord of placedWords) 
                {
                    if (!this.dictionary.contains(placedWord.word))
                    {
                        illegalWords.push(placedWord.word);
                    }
                }
            }
            if (illegalWords.length > 0)
            {
                throw new UserError(GameErrorTypes.PlacementIllegalWord, illegalWords);
            }

            if (!this.firstTurnPlayed)
            {
                if (tilePlacements.length == 1)
                {
                    throw new UserError(GameErrorTypes.PlacementFirstWordMin);
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
                        throw new UserError(GameErrorTypes.PlacementFirstWordLocation);
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
                this.display.showError(err.type, err.extraData);
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

    /**
     * Returns the leading player at this time, according to the amount of points (or null if there's a tie)
     * @returns The leading player at this time
     */
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
    
    /**
     * Returns the current player
     */
    private get currentPlayer(): Player 
    {
        return this.players[this.currentPlayerIndex];
    }
}
