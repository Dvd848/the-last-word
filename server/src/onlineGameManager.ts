import { Server, Socket } from 'socket.io';
import { randomBytes } from "crypto";
import ServerGame from './gameLogic.js';
import Dictionary from './Dictionary.js';
import {Player, PlayerType} from '@shared/Player.js';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { UserError } from "@shared/SharedGame.js";
import {TilePlacement, Tile} from "@shared/Tile.js";
import { getStr, Strings } from '@shared/Strings.js';

const MAX_SUPPORTED_GAMES = 100;
const NUM_PLAYERS = 2;
const GAME_ID_LENGTH = 6;
const GAME_ID_CHARS = "abcdefghijkmnpqrstuvwxyz23456789"; // Skipping a few characters to avoid confusion
const GAME_ID_REGEX = new RegExp(`^[${GAME_ID_CHARS}]+$`);

const CLEANUP_DELAY = 10 * 60 * 1000; // 10 minutes in milliseconds
const CLEANUP_INTERVAL = 30 * 60 * 1000; // Check for inactivity every x minutes
const INACTIVITY_THRESHOLD = 60 * 60 * 1000; // Remove games inactive for x minutes

type GameData = 
{
    serverGame        : ServerGame
    isMarkedForDelete : boolean
    lastActivity      : number
}

const games: { [key: string]: GameData } = {};

interface GameSocket extends Socket 
{
    gameId?: string
    player?: Player
}

/**
 * Checks if the given game ID is valid.
 * @param gameId The game ID to validate.
 * @returns True if valid, false otherwise.
 */
function isValidGameId(gameId: string, length: number): boolean 
{
    if (gameId.length !== length) 
    {
        return false;
    }

    return GAME_ID_REGEX.test(gameId);
}

/**
 * Removes games that have been inactive for longer than INACTIVITY_THRESHOLD.
 */
function cleanupInactiveGames() 
{
    try 
    {
        const now = Date.now();
        for (const gameId in games) 
        {
            const game = games[gameId];
            if (now - game.lastActivity > INACTIVITY_THRESHOLD) 
            {
                console.log(`Removing inactive game ${gameId}`);
                delete games[gameId];
            }
        }
    } 
    catch (error) 
    {
        console.error("Error cleaning up inactive games:", error);
    }
}

/**
 * Generates a random game ID.
 * @returns A new game ID string.
 */
function generateGameId(length: number): string 
{
    const charLen = GAME_ID_CHARS.length;

    const bytes = randomBytes(length);
    let result = "";
    for (let i = 0; i < length; i++) 
    {
        result += GAME_ID_CHARS[bytes[i] % charLen];
    }
    return result;
}

/**
 * Generates a unique random game ID, which doesn't already exist in the DB.
 * @returns A new game ID string.
 */
function generateUniqueGameId(): string 
{
    let gameId: string;
    do 
    {
        gameId = generateGameId(GAME_ID_LENGTH);
    } while (gameId in games);

    return gameId;
}

/**
 * Creates a new game and adds it to the games list.
 * @param dictionary The dictionary instance to use.
 * @param gameId Optional game ID to use; if null, generates a new one.
 * @returns The created game ID.
 */
export function createNewGame(dictionary: Dictionary, gameId: string | null) : string 
{
    if (Object.keys(games).length > MAX_SUPPORTED_GAMES)
    {
        throw new Error(getStr(Strings.MaxSupportedGames));
    }

    if (gameId == null)
    {
        gameId = generateUniqueGameId();
    }

    const game = {
        serverGame : new ServerGame(dictionary, NUM_PLAYERS),
        isMarkedForDelete : false,
        lastActivity      : Date.now()
    }

    game.serverGame.newGame();
    games[gameId] = game;

    console.log(`New game created: ${gameId}`);

    return gameId;
}

/**
 * Checks if a game ID exists in the games list.
 * @param gameId The game ID to check.
 * @returns True if the game exists, false otherwise.
 */
export function checkGameId(gameId: string) : boolean 
{
    return gameId.toLowerCase() in games;
}


/**
 * Sets up the online game manager, handling socket connections and game events.
 * @param io The Socket.IO server instance.
 * @param dictionary The dictionary instance to use for games.
 */
export function onlineGameManager(io: Server, dictionary: Dictionary) 
{
    console.log('onlineGameManager initialized');

    setInterval(cleanupInactiveGames, CLEANUP_INTERVAL);

    io.on('connection', (socket: GameSocket) => {
        console.log('User connected');

        /**
         * Handles a player joining a game.
         * Validates game and player IDs, adds player, and emits initial game state.
         */
        socket.on('joinGame', (gameId: string, playerId: string) => {
            try 
            {
                gameId = gameId.toLowerCase();

                if (!isValidGameId(gameId, GAME_ID_LENGTH))
                {
                    throw new Error(`Invalid Game ID: ${gameId}`);
                }

                console.log(`user joined game ${gameId}`);
    
                if (!(playerId && uuidValidate(playerId) && (uuidVersion(playerId) === 4)))
                {
                    throw new Error(`Invalid Player ID: ${playerId}`);
                }
                
                let game = null;
                if(!games[gameId]) 
                {
                    throw new Error(`Can't find Game ID: ${gameId}`);
                } 
                else 
                {
                    game = games[gameId];
                    console.log(`Game existed: ${gameId}`);
                }

                socket.join(gameId);
                const player = game.serverGame.addPlayer({ 
                    id: playerId, 
                    name: "Player", 
                    playerType: PlayerType.Human
                });

                game.lastActivity = Date.now();
                socket.gameId = gameId;
                socket.player = player;

                io.to(gameId).emit("showNotification", {
                    message: getStr(Strings.PlayerJoined).replace("${playerNum}", (player.index + 1).toString())
                });

                socket.emit('initBoard', {
                    board: game.serverGame.board,
                    player: Player.toJson(player),
                    gameId: gameId,
                    allPlayersJoined: game.serverGame.allPlayersJoined()
                });

                if (game.serverGame.allPlayersJoined())
                {
                    io.to(gameId).emit('gameUpdate', {
                        board: null,
                        currentPlayerIndex: game.serverGame.currentPlayer.index,
                        moveDetails: null,
                        swapDetails: null,
                        points: JSON.stringify(Array.from(game.serverGame.getPoints().entries())),
                        numTilesInBag: game.serverGame.bag.length
                    });
                }

                if (game.serverGame.isGameOver())
                {
                    const winner = game.serverGame.getLeadingPlayer();
                    io.to(gameId).emit('gameOver', {
                        winnerIndex: (winner != null) ? winner.index : null
                    });
                }
            }
            catch (error)
            {
                console.log(`Error: ${error}`);
                socket.emit('generalError', {
                    error: error
                });
            }
        });

        /**
         * Handles a player making a move.
         * Validates turn, updates game state, and broadcasts changes.
         */
        socket.on('makeMove', (move: any) => {
            try 
            {
                const gameId = socket.gameId;
                if (!gameId) 
                {
                    throw new Error("Game ID not found");
                }

                console.log(`user made a move in game ${gameId}`, move);
                const game = games[gameId];
                if (!game) 
                {
                    throw new Error(`Game ${gameId} not found`);
                }
                                
                if (socket.player !== game.serverGame.currentPlayer) 
                {
                    throw new Error(getStr(Strings.NotYourTurn));
                }

                game.lastActivity = Date.now();

                let tilePlacements: TilePlacement[] = move.map((tilePlacement: TilePlacement) => {
                    return {
                        tile: game.serverGame.bag.getTileById(Tile.fromJson(tilePlacement.tile).id),
                        r: tilePlacement.r,
                        c: tilePlacement.c
                    };
                });
                const moveDetails = game.serverGame.endTurnCallback(tilePlacements);

                console.log(`End of turn in game ${gameId}`);

                socket.emit('playerUpdate', {
                    player: Player.toJson(socket.player)
                });

                // Broadcast changes
                io.to(gameId).emit('gameUpdate', {
                    board: game.serverGame.board,
                    currentPlayerIndex: game.serverGame.currentPlayer.index,
                    moveDetails: moveDetails,
                    swapDetails: null,
                    points: JSON.stringify(Array.from(game.serverGame.getPoints().entries())),
                    numTilesInBag: game.serverGame.bag.length
                });

                if (game.serverGame.isGameOver())
                {
                    const winner = game.serverGame.getLeadingPlayer();
                    io.to(gameId).emit('gameOver', {
                        winnerIndex: (winner != null) ? winner.index : null
                    });

                    if (!game.isMarkedForDelete) 
                    {
                        setTimeout(() => {
                            console.log(`Removing game ${gameId} after game over`);
                            if (gameId in games)
                            {
                                delete games[gameId];
                            }
                        }, CLEANUP_DELAY);
                        game.isMarkedForDelete = true;
                    }
                }
                
            }
            catch (err)
            {
                if (err instanceof UserError) 
                {
                    socket.emit("showError", {type: err.type, extraData: err.extraData});
                }
                console.log(`Error: ${err}`);
            }
        });

        /**
         * Handles a player swapping tiles.
         * Validates turn, performs swap, and broadcasts changes.
         */
        socket.on('swapTiles', (tiles: any) => {
            try 
            {
                const gameId = socket.gameId;
                if (!gameId) 
                {
                    throw new Error("Game ID not found");
                }

                console.log(`user wants to swap tiles in game ${gameId}`, tiles);
                const game = games[gameId];
                if (!game) 
                {
                    throw new Error(`Game ${gameId} not found`);
                }
                                
                if (socket.player !== game.serverGame.currentPlayer) 
                {
                    throw new Error(getStr(Strings.NotYourTurn));
                }

                game.lastActivity = Date.now();

                const swapDetails = game.serverGame.swapTiles(tiles.map((tile: Tile) => Tile.fromJson(tile)));  

                console.log(`End of turn in game ${gameId}`);

                socket.emit('playerUpdate', {
                    player: Player.toJson(socket.player)
                });

                // Broadcast changes
                io.to(gameId).emit('gameUpdate', {
                    board: game.serverGame.board,
                    currentPlayerIndex: game.serverGame.currentPlayer.index,
                    moveDetails: null,
                    swapDetails: swapDetails,
                    points: JSON.stringify(Array.from(game.serverGame.getPoints().entries())),
                    numTilesInBag: game.serverGame.bag.length
                });
            }
            catch (err)
            {
                if (err instanceof UserError) 
                {
                    socket.emit("showError", {type: err.type, extraData: err.extraData});
                }
                console.log(`Error: ${err}`);
            }
        });

        /**
         * Handles player disconnect events.
         * Broadcasts notification to other players in the game.
         */
        socket.on('disconnect', () => {
            try
            {
                console.log('user disconnected');
                const gameId = socket.gameId;

                if (gameId) 
                {
                    const playerIndex = socket.player ? socket.player.index + 1 : "";
                    io.to(gameId).emit("showNotification", {
                        message: getStr(Strings.PlayerDisconnected).replace("${playerNum}", playerIndex.toString())
                    });
                }

            }
            catch (error)
            {
                console.log(`Error: ${error}`);
            }
        });
    });
}
