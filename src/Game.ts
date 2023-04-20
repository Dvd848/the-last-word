import { Constants } from './Constants.js';
import Board from './Board.js'
import Player from './Player.js';
import Bag from './Bag.js';
import Tile from './Tile.js';
import { Display, DisplayCallBacks } from './Display.js';

type WordInfo = {
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

export default class Game 
{
    private board: Board;
    private players: Player[];
    private currentPlayerIndex: number;
    private bag: Bag;
    private display : Display;
    private firstTurnPlayed : boolean;
  
    constructor(players: string[]) 
    {
        const that = this;
        this.board = new Board(Constants.BOARD_DIMENSIONS);
        this.players = players.map((name, index) => new Player(name, index + 1, Constants.TILES_PER_PLAYER));
        this.currentPlayerIndex = 0;
        this.bag = new Bag();
        this.firstTurnPlayed = false;

        this.display = new Display(this.board, {
            endTurn: function(tilePlacements: TilePlacement[]){that.endTurnCallback(tilePlacements)}
        });

        this.players.forEach((player) => {
            player.fillRack(this.bag);
            this.display.displayPlayerInfo(player);
        });

        this.display.setActivePlayer(this.currentPlayer);

    }

    private getCreatedWords(tilePlacements: TilePlacement[]): WordInfo[] {
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

    private endTurnCallback(tilePlacements: TilePlacement[]) : void
    {
        const actualTilePlacements : TilePlacement[] = []
        console.log(tilePlacements);

        try
        {
            if (tilePlacements.length > 0)
            {
                // Check if all tiles are placed consecutively horizontally or vertically
                const rValues = tilePlacements.map((tilePlacement) => tilePlacement.r);
                const cValues = tilePlacements.map((tilePlacement) => tilePlacement.c);
    
                if (new Set(rValues).size !== 1 && new Set(cValues).size !== 1)
                {
                    throw "The tiles are not placed consecutively horizontally or vertically";
                }
            }

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
                    throw "One or more tiles are not connected to an existing tile.";
                }
            }

            for (const tilePlacement of tilePlacements) 
            {
                if (!this.board.isTileEmpty(tilePlacement.r, tilePlacement.c)) 
                {
                    throw "One or more tiles are placed on an existing tile.";
                }

                // Mark the placed tile as placed
                this.board.setTile(tilePlacement.r, tilePlacement.c, tilePlacement.tile);
                actualTilePlacements.push(tilePlacement);
            }

            const placedWords: WordInfo[] = this.getCreatedWords(tilePlacements);

            // Check if all placedWords are valid words
            for (const placedWord of placedWords) 
            {
                // TODO: Check against dictionary
                console.log(placedWord.word);
            }

            if (!this.firstTurnPlayed)
            {
                if (tilePlacements.length == 1)
                {
                    throw "The first word must be at least 2 letters long!";
                }
                else if (tilePlacements.length > 0)
                {
                    this.firstTurnPlayed = true;
                }
            }
            
            // All checks passed, move is good

            let newPoints = 0;
            for (const placedWord of placedWords) 
            {
                console.log(placedWord.word, placedWord.points)
                newPoints += placedWord.points;
            }
            this.currentPlayer.points += newPoints;
            
            tilePlacements.forEach((tilePlacement) => {
                this.currentPlayer.removeTile(tilePlacement.tile);
                this.board.getBoardTile(tilePlacement.r, tilePlacement.c).disableMultiplier();
            });

            this.display.finalizePlacements();

            this.currentPlayer.fillRack(this.bag);
            this.display.displayPlayerInfo(this.currentPlayer);

            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            this.display.setActivePlayer(this.currentPlayer);
        }
        catch(err) 
        {
            console.log(err);
            actualTilePlacements.forEach((tilePlacement) => {
                this.board.setTile(tilePlacement.r, tilePlacement.c, null);
            });
        }
    }
    
    private get currentPlayer(): Player 
    {
        return this.players[this.currentPlayerIndex];
    }
  
    public getBoard(): Board 
    {
        return this.board;
    }
}

const game = new Game(["Player 1", "Player 2"]);