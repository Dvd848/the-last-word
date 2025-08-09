import * as Constants from '@shared/Constants.js';
import {ModifiableBoard, Board} from '@shared/Board.js'
import {Player, PlayerType} from '@shared/Player.js';
import {Bag} from '@shared/Bag.js';
import {TilePlacement, Tile} from '@shared/Tile.js';
import Dictionary from './Dictionary.js';
import {GameConfiguration, PlayerDetails, UserError, GameErrorTypes, WordInfo, MoveDetails, SwapDetails} from '@shared/SharedGame.js'

export default class ServerGame 
{
    public board!               : ModifiableBoard;
    public bag!                 : Bag;
    private players!            : Player[];
    private currentPlayerIndex! : number;
    private firstTurnPlayed!    : boolean;
    private dictionary!         : Dictionary;
    private checkDict!          : boolean;
    private consecutivePasses!  : number;
    private _isGameOver!        : boolean;
    private numPlayers          : number;
  
    constructor(dictionary: Dictionary, numPlayers: number) 
    {
        const that = this;

        this.dictionary = dictionary;
        this.numPlayers = numPlayers;
        this.players = [];

        this.newGame();
    }

    /**
     * Starts a new game based on the given configuration
     */
    public newGame() : void
    {
        this.board = new ModifiableBoard(Constants.BOARD_DIMENSIONS, Constants.tileMultipliers);
        this.currentPlayerIndex = 0;
        this.bag = new Bag(Constants.gameTiles[Constants.DefaultLanguage]);
        this.firstTurnPlayed = false;
        this.checkDict = true;
        this.consecutivePasses = 0;
        this._isGameOver = false;
    }

    /**
     * Create the players for the game
     * @param players The player details to use for creating the players
     * @param basedOnCurrent True if the new players should inherit the rack and points from the current players, False otherwise
     * @returns The new players created
     */
    public addPlayer(player: PlayerDetails) : Player
    {
        let newPlayer: Player | null = null;
        this.players.forEach((existingPlayer) => {
            if (player.id == existingPlayer.id) {
                newPlayer = existingPlayer;
            }
        });
        
        if (newPlayer != null)
        {
            console.log(`Found player ${player.id}`, newPlayer);
            return newPlayer;
        }

        if (this.allPlayersJoined())
        {
            throw new Error(`Can't add more than ${this.numPlayers} players`);
        }

        newPlayer = Player.createPlayer(player.name, player.id, this.players.length,
                                        Constants.TILES_PER_PLAYER, player.playerType);
                                              
        newPlayer.fillRack(this.bag);
        this.players.push(newPlayer);

        if (this.allPlayersJoined())
        {
            this.currentPlayerIndex = this.players.length - 1;
            this.moveToNextPlayer();
        }

        return newPlayer;
    }

    public allPlayersJoined() : boolean 
    {
        return (this.players.length == this.numPlayers);
    }

    public checkWord(word: string)
    {
        return this.dictionary.contains(word);
    }

    /**
     * Return the current game configuration
     * @returns The current game configuration
     */
    /*
    public getConfiguration() : GameConfiguration
    {
        return {
            playerDetails: this.players.map(player => {
                return {name: player.name, playerType: player.playerType}
            }),
            checkDict: this.checkDict
        }
    }
    */

    /**
     * Set the current game configuration
     * @param config The configuration to be used
     * @returns True if the configuration was legal, False otherwise
     */
    /*
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
        
            //this.display.setPlayerNames(this.players);

            this.playAutoTurnIfNeeded();
    
            return true;
        }
        catch (err)
        {
            return false;
        }
    }
    */

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
    public swapTiles(tiles: Tile[]) : SwapDetails | null
    {
        if (tiles.length > this.currentPlayer.rack.length)
        {
            return null;
        }

        const numTiles = Math.min(tiles.length, this.bag.length);

        for (let i = 0; i < numTiles; i++)
        {
            if (!this.currentPlayer.hasTile(tiles[i]))
            {
                return null;
            }
        }
        
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

        this.consecutivePasses += 1;

        const swapDetails = {
            playerIndex: this.currentPlayer.index,
            oldTiles: oldTiles
        }

        this.moveToNextPlayer();

        return swapDetails;
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
     * Move to the next player after the current player ended their turn
     */
    private moveToNextPlayer() : void
    {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    /**
     * Callback for the Display to handle the end of a turn
     * @param tilePlacements An array representing the tiles placed on the board 
     * @param forceObjection True if the user requests to override the dictionary check
     */
    public endTurnCallback(tilePlacements: TilePlacement[], forceObjection: boolean) : MoveDetails | null
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

                console.log(tilePlacement.tile)
                if (!this.currentPlayer.hasTile(tilePlacement.tile)) 
                {
                    throw new UserError(GameErrorTypes.UserDoesntHaveTile);
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

            this.currentPlayer.fillRack(this.bag);
            
            if (tilePlacements.length == 0)
            {
                this.consecutivePasses += 1;
            }
            else
            {
                this.consecutivePasses = 0;
            }

            const MoveDetails = {
                playerIndex: this.currentPlayer.index,
                points: newPoints,
                placedWords: placedWords,
                bonusPoints: bonusPoints
            }

            if ( (this.currentPlayer.rack.length == 0) || (this.consecutivePasses == Constants.MAX_CONSECUTIVE_PASS) )
            {
                //this.display.gameOver(this.getLeadingPlayer());
                this._isGameOver = true;
            }
            else
            {
                this.moveToNextPlayer();
            }

            return MoveDetails;
        }
        catch(err) 
        {
            actualTilePlacements.forEach((tilePlacement) => {
                this.board.setTile(tilePlacement.r, tilePlacement.c, null);
            });
            if (err instanceof UserError) 
            {
                throw err;
            }
            else if (err instanceof Error)
            {
                console.log(err.message);
            }
            else
            {
                console.log(err);
            }

            return null;
        }
    }

    /**
     * Returns the leading player at this time, according to the amount of points (or null if there's a tie)
     * @returns The leading player at this time
     */
    public getLeadingPlayer() : Player | null
    {
        let res: Player | null = null;
        let tie = true;
        this.players.forEach((player) => {
            if (res == null)
            {
                res = player;
            }
            else
            {
                if (player.points > res.points)
                {
                    res = player;
                    tie = false;
                }
                else if (player.points < res.points)
                {
                    tie = false;
                }
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
    public get currentPlayer(): Player 
    {
        return this.players[this.currentPlayerIndex];
    }

    public isGameOver() : boolean
    {
        return this._isGameOver;
    }

    /**
     * Get a map of the points for each player (player index -> player points)
     * @returns A map of the points for each player
     */
    public getPoints() : Map<number, number>
    {
        const points = new Map<number, number>();
        this.players.forEach((player) => {
            points.set(player.index, player.points);
        });
        return points;
    }
}

