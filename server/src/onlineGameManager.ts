import { Server, Socket } from 'socket.io';
import ServerGame from './gameLogic.js';
import Dictionary from './Dictionary.js';
import {Player, PlayerType} from '@shared/Player.js';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { UserError } from "@shared/SharedGame.js";
import {TilePlacement, Tile} from "@shared/Tile.js";

const CLEANUP_DELAY = 5 * 60 * 1000; // 5 minutes in milliseconds
const CLEANUP_INTERVAL = 30 * 60 * 1000; // Check for inactivity every x minutes
const INACTIVITY_THRESHOLD = 60 * 60 * 1000; // Remove games inactive for x minutes

type GameData = {
    serverGame        : ServerGame
    isMarkedForDelete : boolean
    lastActivity      : number
}

const games: { [key: string]: GameData } = {};

interface GameSocket extends Socket {
    gameId?: string
    player?: Player
}

function isValidGameID(gameId: string) {
    return /^[A-Za-z0-9_-]{1,32}$/.test(gameId);
}

function cleanupInactiveGames() {
    const now = Date.now();
    for (const gameId in games) {
        const game = games[gameId];
        if (now - game.lastActivity > INACTIVITY_THRESHOLD) {
            console.log(`Removing inactive game ${gameId}`);
            delete games[gameId];
        }
    }
}

function generateGameId(): string {
    return Math.random().toString(36).substring(2, 8);
}

export function createNewGame(dictionary: Dictionary, gameId: string | null) : string {
    if (Object.keys(games).length > 100)
    {
        throw new Error(`Max number of supported games reached!`);
    }

    if (gameId == null)
    {
        gameId = generateGameId();
    }

    const game = {
        serverGame : new ServerGame(dictionary, 2),
        isMarkedForDelete : false,
        lastActivity      : Date.now()
    }
    game.serverGame.newGame();
    games[gameId] = game;

    console.log(`New game created: ${gameId}`);

    return gameId;
}

export function checkGameId(gameId: string) : boolean {
    return gameId in games;
}


export function onlineGameManager(io: Server, dictionary: Dictionary) {
    console.log('onlineGameManager initialized');

    setInterval(cleanupInactiveGames, CLEANUP_INTERVAL);

    io.on('connection', (socket: GameSocket) => {
        console.log('User connected');

        socket.on('joinGame', (gameId: string, playerId: string) => {
            try 
            {
                if (!isValidGameID(gameId))
                {
                    throw new Error(`Invalid Game ID: ${gameId}`);
                }

                console.log(`user joined game ${gameId}`);
    
                if (!(playerId && uuidValidate(playerId) && (uuidVersion(playerId) === 4)))
                {
                    throw new Error(`Invalid Player ID: ${playerId}`);
                }
                
                let game = null;
                if(!games[gameId]) {
                    throw new Error(`Can't find Game ID: ${gameId}`);
                } else {
                    game = games[gameId];
                    console.log(`Game existed: ${gameId}`);
                }

                socket.gameId = gameId;

                game.lastActivity = Date.now();

                socket.join(gameId);
                const player = game.serverGame.addPlayer({ 
                    id: playerId, 
                    name: "Player", 
                    playerType: PlayerType.Human
                });

                socket.player = player;

                io.to(gameId).emit("showNotification", {
                    message: `שחקן/ית ${player.index + 1} התחבר/ה`
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
                    io.to(gameId).emit('gameOver', {
                        winnerIndex: game.serverGame.getLeadingPlayer()
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

        socket.on('makeMove', (move: any) => {
            try 
            {
                const gameId = socket.gameId;
                if (!gameId) {
                    throw new Error("Game ID not found");
                }

                console.log(`user made a move in game ${gameId}`, move);
                const game = games[gameId];
                if (!game) {
                    throw new Error(`Game ${gameId} not found`);
                }
                                
                if (socket.player !== game.serverGame.currentPlayer) {
                    throw new Error("Not your turn");
                }

                game.lastActivity = Date.now();

                let tilePlacements: TilePlacement[] = move.map((tilePlacement: TilePlacement) => {
                    return {tile: game.serverGame.bag.getTileById(Tile.fromJson(tilePlacement.tile).id), 
                                                                  r: tilePlacement.r, c: tilePlacement.c}
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
                    io.to(gameId).emit('gameOver', {
                        winnerIndex: game.serverGame.getLeadingPlayer()
                    });

                    if (!game.isMarkedForDelete) {
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

        socket.on('swapTiles', (tiles: any) => {
            // TODO: Code duplication with MakeMove
            try 
            {
                const gameId = socket.gameId;
                if (!gameId) {
                    throw new Error("Game ID not found");
                }

                console.log(`user wants to swap tiles in game ${gameId}`, tiles);
                const game = games[gameId];
                if (!game) {
                    throw new Error(`Game ${gameId} not found`);
                }
                                
                if (socket.player !== game.serverGame.currentPlayer) {
                    throw new Error("Not your turn");
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

        socket.on('disconnect', () => {
            try
            {
                console.log('user disconnected');
                const gameId = socket.gameId;

                if (gameId) 
                {
                    const playerIndex = socket.player ? socket.player.index + 1 : "";
                    io.to(gameId).emit("showNotification", {
                        message: `שחקן/ית ${playerIndex} התנתק/ה`
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
