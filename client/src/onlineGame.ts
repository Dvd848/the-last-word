import { io, Socket } from 'socket.io-client';
import Game from './Game'
import {Board} from '../../shared/src/Board'
import {Player} from '../../shared/src/Player'
import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';
import Cookies from 'js-cookie'
import {TilePlacement, Tile} from '../../shared/src/Tile';

/**
 * Extracts the game ID from the given URL string.
 * @param urlString The URL string to parse.
 * @returns The game ID if found, otherwise null.
 */
export function getGameId(urlString: string): string | null 
{
    const url = new URL(urlString);
    const pathSegments = url.pathname.split('/').filter(Boolean); // removes empty strings
  
    const gameIndex = pathSegments.indexOf('game');
    if (gameIndex !== -1 && gameIndex + 1 < pathSegments.length) 
    {
      return pathSegments[gameIndex + 1];
    }
  
    return null;
}

class OnlineGame 
{
    socket: Socket;
    gameId: string | null;
    playerId: string;
    game: Game;
    waitingForAllPlayers : boolean = true;

    /**
     * Constructs an OnlineGame instance, sets up socket event handlers,
     * initializes player ID, and prepares the game logic.
     */
    constructor() 
    {
        const that = this;

        // Some of these callbacks are dummy callbacks needed to keep common interface
        this.game = new Game({
            endTurn: function(tilePlacements: TilePlacement[]){that.makeMove(tilePlacements);},
            swapTiles: function(tiles: Tile[]){that.swapTiles(tiles);},
            getNumTilesInBag: function(){return -1;},
            checkWord: function(word: string) {return Promise.resolve(false);},
            isCurrentPlayersTurn: function(){return false;},
            sendChatMessage: function(message: string) {that.sendChatMessage(message);}
        });
        this.gameId = null;
        const playerId = Cookies.get("playerId");
        if (playerId 
            && uuidValidate(playerId) 
            && (uuidVersion(playerId) === 4)) {
            this.playerId = playerId;
        }
        else 
        {
            this.playerId = uuidv4();
            Cookies.set("playerId", this.playerId);
        }

        this.socket = io(); // Connects to the specified URL
        this.socket.on('connect', () => {
            console.log("connected");
            this.joinGame();
        });

        this.socket.on('playerJoined', () => {
            console.log("Player joined");
        });

        this.socket.on('initBoard', (initObj) => {
            console.log("initBoard", initObj);
            const board = Board.fromJson(initObj.board);
            const player = Player.fromJson(initObj.player);
            this.game.initBoard(board);
            this.game.placeTilesOnBoard(board);
            this.game.initPlayer(player);
            if (!initObj.allPlayersJoined)
            {
                this.game.waitForPlayers(initObj.gameId);
            }
            else
            {
                this.waitingForAllPlayers = false;
            }
        });

        this.socket.on('playerUpdate', (playerState) => {
            console.log("playerUpdate", playerState);
            this.game.updatePlayer(Player.fromJson(playerState.player));
            
        });

        this.socket.on('gameUpdate', (gameState) => {
            console.log("gameUpdate", gameState);
            if (this.waitingForAllPlayers)
            {
                this.waitingForAllPlayers = false;
                this.game.allPlayersJoined();
            }

            if (gameState.board != null)
            {
                const board = Board.fromJson(gameState.board);
                this.game.placeTilesOnBoard(board);
            }
            this.game.endTurn(gameState.currentPlayerIndex, gameState.moveDetails, 
                              new Map<number, number>(JSON.parse(gameState.points)));
            this.game.numTilesInBag = gameState.numTilesInBag;
            this.game.updateTurn(gameState.currentPlayerIndex);

            if (gameState.swapDetails != null) 
            {
                this.game.completeSwap(gameState.swapDetails.playerIndex, 
                                       gameState.swapDetails.oldTiles.map((tile: Tile) => Tile.fromJson(tile)));
            }
        });

        this.socket.on('showError', (errorDetails) => {
            console.log("showError", errorDetails);
            this.game.showError(errorDetails.type, errorDetails.extraData);
        });

        this.socket.on('generalError', (errorDetails) => {
            console.log("generalError", errorDetails);
            window.location.href = "/";
        });

        this.socket.on('showNotification', (notificationDetails) => {
            console.log("showNotification", notificationDetails);
            this.game.logNotification(notificationDetails.message);
        });

        this.socket.on('gameOver', (gameOverDetails) => {
            console.log("gameOver", gameOverDetails);
            this.game.gameOver(gameOverDetails.winnerIndex);
        });

        this.socket.on('showChatMessage', (chatMessageDetails) => {
            console.log("showChatMessage", chatMessageDetails);
            this.game.showChatMessage(chatMessageDetails.playerIndex, chatMessageDetails.message);
        });
    }

    /**
     * Joins the game by emitting a 'joinGame' event with the game ID and player ID.
     */
    joinGame() 
    {
        // Extract the gameId (the part after "/game/")
        const gameId = getGameId(window.location.href);
        if (gameId == null)
        {
            console.error("Invalid game URL");
            return;
        }
        this.gameId = gameId;

        // Emit the 'joinGame' event with the extracted gameId
        console.log("joinGame", this.gameId, this.playerId);
        this.socket.emit('joinGame', this.gameId, this.playerId);
    }

    /**
     * Emits a 'makeMove' event with the tile placements to the server.
     * @param tilePlacements The tiles placed during the move.
     */
    makeMove(tilePlacements: TilePlacement[]) 
    {
        if (!this.gameId) 
        {
            console.error("No game id");
            return;
        }
        console.log("makeMove", tilePlacements);
        this.socket.emit('makeMove', tilePlacements);
    }

    /**
     * Emits a 'sendChatMessage' event with the chat message to the server.
     * @param message The chat message to send.
     */
    sendChatMessage(message: string) 
    {
        if (!this.gameId) 
        {
            console.error("No game id");
            return;
        }
        console.log("sendChatMessage", message);
        this.socket.emit('sendChatMessage', message);
    }

    /**
     * Emits a 'swapTiles' event with the tiles to swap to the server.
     * @param tiles The tiles to swap.
     */
    swapTiles(tiles: Tile[]) 
    {
        if (!this.gameId) 
        {
            console.error("No game id");
            return;
        }
        console.log("swapTiles", tiles);
        this.socket.emit('swapTiles', tiles);
    }

}

export { OnlineGame }
