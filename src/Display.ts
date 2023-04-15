import Board from "./Board.js";
import Player from "./Player.js";


export default class Display
{
    private board : Element;

    constructor(board: Board)
    {
        this.board = document.getElementById("board")!;
        this.createBoard(board);
    }

    private createBoard(board: Board) : void
    {
        this.board.innerHTML = '';

        for (let x = 0; x < board.size; x++) 
        {
            for (let y = 0; y < board.size; y++) 
            {
                const tileElement = document.createElement('div');
                tileElement.classList.add('board_tile');
                tileElement.dataset.x = x.toString();
                tileElement.dataset.y = y.toString();
                this.board.appendChild(tileElement);
            }
        }
    }

    public fillPlayerRack(player_index: number, player: Player) : void
    {
        const rack = document.getElementById(`player${player_index}_rack`);
        if (rack == null)
        {
            throw new Error(`Can't find player rack for player ${player_index}`);
        }

        rack.innerHTML = '';

        player.rack.forEach((tile) => {
            const tileElement = document.createElement('div');
            const letter = document.createTextNode(tile.letter);
            tileElement.classList.add('game_tile');
            tileElement.appendChild(letter);

            const pointsElement = document.createElement('div');
            const points = document.createTextNode(tile.points.toString());
            pointsElement.classList.add('points');
            pointsElement.appendChild(points);
            tileElement.appendChild(pointsElement);

            rack.appendChild(tileElement);
        });
    }
}