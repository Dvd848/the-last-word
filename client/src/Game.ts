import * as Constants from '../../shared/src/Constants';
import {ModifiableBoard, Board} from '../../shared/src/Board'
import {Player, PlayerType} from '../../shared/src/Player';
import {TilePlacement, Tile} from '../../shared/src/Tile';
import { DisplayCallBacks, Display } from './Display';
import {GameConfiguration, PlayerDetails, UserError, GameErrorTypes, MoveDetails, SwapDetails} from '../../shared/src/SharedGame';

export default class Game 
{
    public  numTilesInBag       : number = 0;

    private board!              : Board;
    private player              : Player | null = null;
    private display!            : Display;
    private firstTurnPlayed     : boolean = false;
    private consecutivePasses!  : number;
    private isGameOver!         : boolean;
    private onlineGameCallbacks : DisplayCallBacks;
    private currentPlayersTurn  : boolean = false;
  
    constructor(/*gameConfiguration: GameConfiguration*/ callbacks: DisplayCallBacks) 
    {
        const that = this;
        this.onlineGameCallbacks = callbacks;

        this.display = new Display({
            endTurn: function(tilePlacements: TilePlacement[], forceObjection: boolean){that.endTurnCallback(tilePlacements, forceObjection);},
            /*getConfiguration: function(){return that.getConfiguration();},*/
            /*setConfiguration: function(config: GameConfiguration){that.setConfigurationCallback(config);},*/
            swapTiles: function(tiles: Tile[]){that.swapTilesCallback(tiles);},
            getNumTilesInBag: function(){return that.numTilesInBag;},
            /*newGame: function(){that.newGame(that.getConfiguration())},*/
            checkWord: function(word: string) {return that.checkWordCallback(word);},
            isCurrentPlayersTurn: function() {return that.currentPlayersTurn;}
        });

        //this.newGame(gameConfiguration);
    }

    /**
     * Starts a new game based on the given configuration
     * @param gameConfiguration The game configuration for the game
     */
    public newGame(gameConfiguration: GameConfiguration) : void
    {
        this.board = new Board(Constants.BOARD_DIMENSIONS, Constants.tileMultipliers);
        this.firstTurnPlayed = false;
        this.consecutivePasses = 0;
        this.display.init(this.board);
        this.isGameOver = false;
        this.numTilesInBag = 0;
        this.currentPlayersTurn = false;
        
        //this.display.show();
    }

    public initBoard(board: Board)
    {
        this.board = board;
        this.display.init(this.board);
        this.display.show();
        
    }

    public waitForPlayers(gameId: string) {
        this.display.showWaitScreen(gameId);
    }

    public allPlayersJoined() {
        this.display.hideWaitScreen();
    }

    public initPlayer(player: Player)
    {
        this.player = player;
        this.display.initPlayer(player);
    }

    public updatePlayer(player: Player)
    {
        this.player = player;
    }

    public updateTurn(currentPlayerIndex: number)
    {
        this.currentPlayersTurn = this.currentPlayer.index == currentPlayerIndex;
    }

    /**
     * Return the current game configuration
     * @returns The current game configuration
     */
    /*
    public getConfiguration() : GameConfiguration
    {
        return {
            playerDetails: this.players.map(player => {return {name: player.name, playerType: player.playerType}}),
            checkDict: this.checkDict
        }
    }
        */

    /**
     * Set the current game configuration
     * @param config The configuration to be used
     * @returns True if the configuration was legal, False otherwise
     */
    private setConfigurationCallback(config: GameConfiguration) : boolean
    {
        /*
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

            //this.playAutoTurnIfNeeded();
    
            return true;
        }
        catch (err)
        {
            return false;
        }
            */ 
        return false;
    }

    /**
     * Callback for the Display to check if a given word exists in the dictionary
     * @param word The word to check
     * @returns True if the word exists in the dictionary, False otherwise
     */
    private async checkWordCallback(word: string): Promise<boolean> {
        try {
            const response = await fetch('/checkWord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word: word }),
            });
    
            const data = await response.json();
            return data.isValid;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }  

    /**
     * Callback for the Display to swap tiles for the current player
     * @param tiles The tiles to swap
     */
    private swapTilesCallback(tiles: Tile[]) : void
    {
        this.onlineGameCallbacks.swapTiles(tiles);
        //this.display.logSwap(this.currentPlayer, oldTiles);
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
                //this.board.setTile(tilePlacement.r, tilePlacement.c, tilePlacement.tile);
                actualTilePlacements.push(tilePlacement);
            }

            this.onlineGameCallbacks.endTurn(actualTilePlacements, false);

            /*
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
            */

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
                //this.board.setTile(tilePlacement.r, tilePlacement.c, null);
            });
        }
    }

    
    /**
     * Returns the current player
     */
    private get currentPlayer(): Player 
    {
        //return this.players[this.currentPlayerIndex];
        if (this.player == null)
        {
            throw new Error("Player not set");
        }
        return this.player;
    }

    public showError(errorType: number, extraData: any) : void 
    {
        this.display.showError(errorType, extraData);
    }

    public placeTilesOnBoard(board: Board) {
        this.board = board;
        this.display.finalizePlacements();
        for (let r = 0; r < board.height; r++) 
        {
            for (let c = 0; c < board.width; c++) 
            {
                const tile = board.getTile(r, c);
                if ( (tile != null) && !this.display.hasTile(r, c))
                {
                    this.display.setTile(r, c, tile);
                }
            }
        }
    }

    public endTurn(activePlayerIndex : number, moveDetails: MoveDetails, points: Map<number, number>) : void
    {
        this.display.show();
        if (moveDetails != null)
        {
            this.display.logMoveDetails(moveDetails.playerIndex, moveDetails.points, 
                                        moveDetails.placedWords, moveDetails.bonusPoints);
        }
        this.display.updatePlayerState(this.player!, activePlayerIndex, points);
    }

    public logNotification(notification: string) : void
    {
        this.display.logNotification(notification);
    }
    
    public gameOver(winnerIndex: number) : void
    {
        this.display.gameOver(winnerIndex);
    }

    public completeSwap(playerIndex: number, oldTiles: Tile[])
    {
        this.display.logSwap(playerIndex, oldTiles);
    }

}
