import * as Constants from '../../shared/src/Constants';
import {Board} from '../../shared/src/Board'
import {Player} from '../../shared/src/Player';
import {TilePlacement, Tile} from '../../shared/src/Tile';
import { DisplayCallBacks, Display } from './Display';
import {GameConfiguration, UserError, GameErrorTypes, MoveDetails} from '../../shared/src/SharedGame';

export default class Game 
{
    public  numTilesInBag       : number = 0;

    private board!              : Board;
    private player              : Player | null = null;
    private display!            : Display;
    private firstTurnPlayed     : boolean = false;
    private onlineGameCallbacks : DisplayCallBacks;
    private currentPlayersTurn  : boolean = false;
  
    constructor(callbacks: DisplayCallBacks) 
    {
        const that = this;
        this.onlineGameCallbacks = callbacks;

        this.display = new Display({
            endTurn: function(tilePlacements: TilePlacement[]){that.endTurnCallback(tilePlacements);},
            swapTiles: function(tiles: Tile[]){that.swapTilesCallback(tiles);},
            getNumTilesInBag: function(){return that.numTilesInBag;},
            checkWord: function(word: string) {return that.checkWordCallback(word);},
            isCurrentPlayersTurn: function() {return that.currentPlayersTurn;}
        });
    }

    /**
     * Starts a new game based on the given configuration.
     * Initializes the board, resets turn state, and prepares the display.
     * @param gameConfiguration The game configuration for the game
     */
    public newGame() : void
    {
        this.board = new Board(Constants.BOARD_DIMENSIONS, Constants.tileMultipliers);
        this.firstTurnPlayed = false;
        this.display.init(this.board);
        this.numTilesInBag = 0;
        this.currentPlayersTurn = false;
    }

    /**
     * Initializes the board and shows it on the display.
     * @param board The board to initialize.
     */
    public initBoard(board: Board)
    {
        this.board = board;
        this.display.init(this.board);
        this.display.show();
    }

    /**
     * Shows the waiting screen until all players have joined.
     * @param gameId The game ID to display.
     */
    public waitForPlayers(gameId: string) 
    {
        this.display.showWaitScreen(gameId);
    }

    /**
     * Hides the waiting screen when all players have joined.
     */
    public allPlayersJoined() 
    {
        this.display.hideWaitScreen();
    }

    /**
     * Initializes the player and updates the display for the player.
     * @param player The player to initialize.
     */
    public initPlayer(player: Player)
    {
        this.player = player;
        this.display.initPlayer(player);
    }

    /**
     * Updates the current player reference.
     * @param player The player to update.
     */
    public updatePlayer(player: Player)
    {
        this.player = player;
    }

    /**
     * Updates the turn state to indicate if it's the current player's turn.
     * @param currentPlayerIndex The index of the player whose turn it is.
     */
    public updateTurn(currentPlayerIndex: number)
    {
        this.currentPlayersTurn = this.currentPlayer.index == currentPlayerIndex;
    }

    /**
     * Callback for the Display to check if a given word exists in the dictionary.
     * @param word The word to check.
     * @returns True if the word exists in the dictionary, False otherwise.
     */
    private async checkWordCallback(word: string): Promise<boolean> {
        try 
        {
            const response = await fetch('/checkWord', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word: word }),
            });
    
            const data = await response.json();
            return data.isValid;
        } 
        catch (error) 
        {
            console.error('Error:', error);
            return false;
        }
    }  

    /**
     * Callback for the Display to swap tiles for the current player.
     * @param tiles The tiles to swap.
     */
    private swapTilesCallback(tiles: Tile[]) : void
    {
        this.onlineGameCallbacks.swapTiles(tiles);
        //this.display.logSwap(this.currentPlayer, oldTiles);
    }

    /**
     * Verify that the given tiles were placed in a consecutive manner.
     * @param tilePlacements An array representing the tiles placed on the board.
     * @returns True if the tiles were placed consecutively on the board.
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
     * Verify that all the tiles placed during this turn are connected legally.
     * @param tilePlacements An array representing the tiles placed on the board.
     * @returns True if all the tiles are connected legally.
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
     * Callback for the Display to handle the end of a turn.
     * Validates the move and passes it to the game logic or shows an error.
     * @param tilePlacements An array representing the tiles placed on the board.
     */
    private endTurnCallback(tilePlacements: TilePlacement[]) : void
    {
        const actualTilePlacements : TilePlacement[] = [];

        try
        {
            // TODO: Share code with server side
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

                actualTilePlacements.push(tilePlacement);
            }

            this.onlineGameCallbacks.endTurn(actualTilePlacements);
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
        }
    }

    
    /**
     * Returns the current player.
     * @returns The current Player object.
     */
    private get currentPlayer(): Player 
    {
        if (this.player == null)
        {
            throw new Error("Player not set");
        }
        return this.player;
    }

    /**
     * Show an error to the user via the display.
     * @param errorType The error type.
     * @param extraData Additional error data.
     */
    public showError(errorType: number, extraData: any) : void 
    {
        this.display.showError(errorType, extraData);
    }

    /**
     * Places tiles on the board and finalizes their placement in the display.
     * @param board The board with tiles to place.
     */
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

    /**
     * Handles the end of a turn, updating the display and player state.
     * @param activePlayerIndex The index of the active player.
     * @param moveDetails Details of the move performed.
     * @param points Map of player indices to their points.
     */
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

    /**
     * Logs a notification to the display.
     * @param notification The notification message.
     */
    public logNotification(notification: string) : void
    {
        this.display.logNotification(notification);
    }
    
    /**
     * Handles the end of the game and shows the winner.
     * @param winnerIndex The index of the winning player.
     */
    public gameOver(winnerIndex: number) : void
    {
        this.display.gameOver(winnerIndex);
    }

    /**
     * Completes a tile swap and logs it to the display.
     * @param playerIndex The index of the player who swapped tiles.
     * @param oldTiles The tiles that were swapped.
     */
    public completeSwap(playerIndex: number, oldTiles: Tile[])
    {
        this.display.logSwap(playerIndex, oldTiles);
    }

}
