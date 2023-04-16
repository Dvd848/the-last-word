import Board from "./Board.js";
import Player from "./Player.js";
import Tile from "./Tile.js";

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
        this.makeBoardDroppable();
        this.makeElementDroppable(document.getElementById("active_player_rack")!);
    }

    private makeElementDroppable(element: Element) : void
    {
        element.classList.add('droppable');
        element.addEventListener('dragenter', function(e) {
            const target = e.target as Element;
            e.preventDefault();
            target.classList.add('drag-over');
        })
        element.addEventListener('dragover', function(e) {
            const target = e.target as Element;
            e.preventDefault();
            target.classList.add('drag-over');
        });
        element.addEventListener('dragleave', function(e) {
            const target = e.target as Element;
            e.preventDefault();
            target.classList.remove('drag-over');
        });
        element.addEventListener('drop', function(e) {
            const target = e.target as Element;
            const dragEvent = e as DragEvent;

            target.classList.remove('drag-over');

            if (!target.classList.contains("droppable"))
            {
                return;
            }

            if (dragEvent.dataTransfer == null)
            {
                return;
            }

            const id = dragEvent.dataTransfer.getData('text/plain');
            const draggable = document.getElementById(id);

            if (draggable == null) 
            {
                return;
            }

            target.appendChild(draggable);
            draggable.classList.remove('hide');
        });
    }

    private makeBoardDroppable() : void
    {
        const tiles = document.querySelectorAll('.board_tile');
        tiles.forEach(tile => {
            this.makeElementDroppable(tile);
        });
    }

    private createTile(tile: Tile, is_draggable: boolean) : Element
    {
        const tileElement = document.createElement('div');
        const letter = document.createTextNode(tile.letter);
        tileElement.classList.add('game_tile');

        if (is_draggable)
        {
            tileElement.classList.add('grabbable');
            tileElement.setAttribute("draggable", "true");

            tileElement.addEventListener('dragstart', function(e){
                const target = e.target as Element;
                const dragEvent = e as DragEvent;

                if (dragEvent.dataTransfer != null)
                {
                    dragEvent.dataTransfer.setData('text/plain', target.id);
                }
                setTimeout(() => {
                    target.classList.add('hide');
                }, 0);
            });

            tileElement.addEventListener('dragend', function(e){
                const target = e.target as Element;
                target.classList.remove('hide');
            });
        }

        tileElement.appendChild(letter);
        tileElement.setAttribute("id", `game_tile_${tile.id}`);

        const pointsElement = document.createElement('div');
        const points = document.createTextNode(tile.points.toString());
        pointsElement.classList.add('points');
        pointsElement.appendChild(points);
        tileElement.appendChild(pointsElement);

        return tileElement
    }

    public fillPlayerRack(player: Player) : void
    {
        const rack = document.getElementById(`player${player.id}_rack`);
        if (rack == null)
        {
            throw new Error(`Can't find player rack for player ${player.id}`);
        }

        rack.innerHTML = '';

        player.rack.forEach((tile) => {
            rack.appendChild(this.createTile(tile, false));
        });
    }

    public setActivePlayer(player: Player) : void
    {
        const player_rack = document.getElementById(`player${player.id}_rack`);
        const active_rack = document.getElementById(`active_player_rack`);
        if ( (player_rack == null) || (active_rack == null) )
        {
            throw new Error(`Can't find rack!`);
        }

        player_rack.innerHTML = '';

        player.rack.forEach((tile) => {
            document.getElementById(`game_tile_${tile.id}`)?.remove();
            active_rack.appendChild(this.createTile(tile, true));
        });
    }
}