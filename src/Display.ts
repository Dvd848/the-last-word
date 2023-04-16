import Board from "./Board.js";
import Player from "./Player.js";
import Tile from "./Tile.js";

export type TilePlacement =
{
    tile: Tile;
    x: number;
    y: number;
}

export interface DisplayCallBacks
{
    endTurn: (tile_placements: TilePlacement[]) => boolean
}

export class Display
{
    private board        : Element;
    private activeTiles : Map<number, Tile>;
    private callbacks    : DisplayCallBacks;

    constructor(board: Board, callbacks: DisplayCallBacks)
    {
        this.board = document.getElementById("board")!;
        this.activeTiles = new Map<number, Tile>();
        this.callbacks = callbacks;
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
        this.attachEvents();
    }

    private attachEvents() : void
    {
        this.makeBoardDroppable();
        this.makeElementDroppable(document.getElementById("active_player_rack")!);
        this.configureButtons();
    }

    private configureButtons() : void
    {
        const endTurnButton = document.getElementById("end_turn_button")!;
        const that = this;
        endTurnButton.addEventListener('click', function(e){
            const tilePlacements : TilePlacement[] = [];

            const activeTiles = document.querySelectorAll(".active_tile");

            activeTiles.forEach((activeTile) => {
                const parent = activeTile.parentElement;
                if (parent?.classList.contains("board_tile"))
                {
                    const tileId = parseInt(activeTile.id.replace("game_tile_", ""));

                    tilePlacements.push({
                        tile: that.activeTiles.get(tileId)!, 
                        x: parseInt(parent.dataset.x!), 
                        y: parseInt(parent.dataset.y!)
                    });
                }
            });

            const accepted = that.callbacks.endTurn(tilePlacements);
            console.log(accepted);
        })
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

    private createTile(tile: Tile, is_draggable: boolean, is_active: boolean) : Element
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

        if (is_active)
        {
            tileElement.classList.add("active_tile");
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
            rack.appendChild(this.createTile(tile, false, false));
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

        this.activeTiles.clear();

        player.rack.forEach((tile) => {
            document.getElementById(`game_tile_${tile.id}`)?.remove();
            active_rack.appendChild(this.createTile(tile, true, true));
            this.activeTiles.set(tile.id, tile);
        });
    }
}