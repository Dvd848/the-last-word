import Board from "./Board.js";


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
                tileElement.classList.add('tile');
                tileElement.dataset.x = x.toString();
                tileElement.dataset.y = y.toString();
                this.board.appendChild(tileElement);
            }
        }
    }
}