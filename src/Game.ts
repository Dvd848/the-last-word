import { Constants } from './Constants.js';
import Board from './Board.js'
import Player from './Player.js';
import Bag from './Bag.js';
import Display from './Display.js';

export default class Game 
{
    private board: Board;
    private players: Player[];
    private currentPlayerIndex: number;
    private bag: Bag;
    private display : Display;
  
    constructor(players: string[]) 
    {
        this.board = new Board(Constants.BOARD_DIMENSIONS);
        this.players = players.map((name, index) => new Player(name, index + 1, Constants.TILES_PER_PLAYER));
        this.currentPlayerIndex = 0;
        this.bag = new Bag();

        this.display = new Display(this.board);

        this.players.forEach((player) => {
            player.fillRack(this.bag);
            this.display.fillPlayerRack(player);
        });

        this.display.setActivePlayer(this.players[0]);

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