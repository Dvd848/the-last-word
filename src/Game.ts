import { Constants } from './Constants.js';
import Board from './Board.js'
import Player from './Player.js';
import Bag from './Bag.js';
import { Display, TilePlacement, DisplayCallBacks } from './Display.js';

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
            this.display.fillPlayerRack(player);
        });

        this.display.setActivePlayer(this.players[this.currentPlayerIndex]);

    }

    private getWordsToCheck(tilePlacements: TilePlacement[]): string[] {
        const words = new Set<string>();
        const axes = ["x", "y"];

        for (const placement of tilePlacements) {
            for (let axis of axes)
            {
                let word = "";
                let start_index = { x: -1, y: -1 };
                
                // Scan vertically up
                let current = {x: placement.x, y: placement.y};
                while (this.board.isTileInBoard(current["x"], current["y"]) && !this.board.isTileEmpty(current["x"], current["y"])) 
                {
                    start_index = { x: current["x"], y: current["y"] };
                    current[axis as keyof typeof current]--;
                }
                
                // Reset to starting tile
                current["x"] = start_index.x;
                current["y"] = start_index.y;
                
                // Scan vertically down
                while (this.board.isTileInBoard(current["x"], current["y"]) && !this.board.isTileEmpty(current["x"], current["y"])) 
                {
                    word += this.board.getTile(current["x"], current["y"])!.letter;
                    current[axis as keyof typeof current]++;
                }
                
                if (word.length > 1) 
                {
                    words.add(JSON.stringify({ word, start: start_index }));
                }
            }
        }
        
        return Array.from(words, (JSONEntry) => JSON.parse(JSONEntry).word);
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
                const xValues = tilePlacements.map((tilePlacement) => tilePlacement.x);
                const yValues = tilePlacements.map((tilePlacement) => tilePlacement.y);
    
                if (new Set(xValues).size !== 1 && new Set(yValues).size !== 1)
                {
                    throw "The tiles are not placed consecutively horizontally or vertically";
                }
            }

            if (this.firstTurnPlayed && tilePlacements.length > 0)
            {
                let connected = false;
                for (const tilePlacement of tilePlacements) 
                {
                    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
                    {
                        let new_x = tilePlacement.x + dx;
                        let new_y = tilePlacement.y + dy;
                        if (this.board.isTileInBoard(new_x, new_y) && !this.board.isTileEmpty(new_x, new_y))
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
                if (!this.board.isTileEmpty(tilePlacement.x, tilePlacement.y)) 
                {
                    throw "One or more tiles are placed on an existing tile.";
                }

                // Mark the placed tile as placed
                this.board.setTile(tilePlacement.x, tilePlacement.y, tilePlacement.tile);
                actualTilePlacements.push(tilePlacement);
            }

            const placedWords: string[] = this.getWordsToCheck(tilePlacements);

            // Check if all placedWords are valid words
            for (const placedWord of placedWords) 
            {
                // TODO: Check against dictionary
                console.log(placedWord);
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
            
            tilePlacements.forEach((tilePlacement) => {
                this.players[this.currentPlayerIndex].removeTile(tilePlacement.tile);
            });

            this.display.finalizePlacements();

            this.players[this.currentPlayerIndex].fillRack(this.bag);
            this.display.fillPlayerRack(this.players[this.currentPlayerIndex]);

            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            this.display.setActivePlayer(this.players[this.currentPlayerIndex]);
        }
        catch(err) 
        {
            console.log(err);
            actualTilePlacements.forEach((tilePlacement) => {
                this.board.setTile(tilePlacement.x, tilePlacement.y, null);
            });
        }
    }
    
    public getCurrentPlayer(): Player 
    {
        return this.players[this.currentPlayerIndex];
    }
  
    public getBoard(): Board 
    {
        return this.board;
    }
}

const game = new Game(["Player 1", "Player 2"]);