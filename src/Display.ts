import Board from "./Board";
import Player from "./Player";
import Tile from "./Tile";
import { TilePlacement, WordInfo } from "./Game";
import * as Constants from "./Constants"
import * as Utils from "./Utils"

import * as bootstrap from 'bootstrap';

export interface DisplayCallBacks
{
    endTurn: (tile_placements: TilePlacement[]) => void;
}

export class Display
{
    private board        : Element;
    private activeTiles  : Map<number, Tile>;
    private callbacks    : DisplayCallBacks;

    constructor(board: Board, callbacks: DisplayCallBacks)
    {
        this.board = document.getElementById("board")!;
        this.activeTiles = new Map<number, Tile>();
        this.callbacks = callbacks;
        this.createBoard(board);
    }

    public show() : void
    {
        document.getElementById("game")!.classList.remove("hide");
        document.getElementById("loader")!.remove();
    }

    private createBoard(board: Board) : void
    {
        this.board.innerHTML = '';

        for (let r = 0; r < board.height; r++) 
        {
            for (let c = 0; c < board.width; c++) 
            {
                const tileElement = document.createElement('div');
                tileElement.classList.add('board_tile');
                tileElement.dataset.r = r.toString();
                tileElement.dataset.c = c.toString();

                tileElement.classList.add(`tile_type_${board.getBoardTile(r, c).type}`);

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
        endTurnButton.innerText = Utils.getTranslation(Constants.DefaultLanguage, Constants.Strings.EndTurn);
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
                        r: parseInt(parent.dataset.r!), 
                        c: parseInt(parent.dataset.c!)
                    });
                }
            });

            that.callbacks.endTurn(tilePlacements);
        })
    }

    public finalizePlacements() : void
    {
        const activeTiles = document.querySelectorAll(".active_tile");
        activeTiles.forEach((activeTile) => {
            activeTile.classList.remove("active_tile");
            activeTile.classList.remove('grabbable');
            activeTile.setAttribute("draggable", "false");
        });
    }

    private makeElementDroppable(element: Element) : void
    {
        element.classList.add('droppable');
        element.addEventListener('dragenter', function(e) {
            const target = e.target as Element;
            if (target.classList == undefined)
            {
                return;
            }
            e.preventDefault();
            target.classList.add('drag-over');
        })
        element.addEventListener('dragover', function(e) {
            const target = e.target as Element;
            if (target.classList == undefined)
            {
                return;
            }
            e.preventDefault();
            target.classList.add('drag-over');
        });
        element.addEventListener('dragleave', function(e) {
            const target = e.target as Element;
            if (target.classList == undefined)
            {
                return;
            }
            e.preventDefault();
            target.classList.remove('drag-over');
        });
        element.addEventListener('drop', function(e) {
            const target = e.target as Element;
            const dragEvent = e as DragEvent;

            if (target.classList == undefined)
            {
                return;
            }

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

                if (target.classList == undefined)
                {
                    return;
                }

                if (dragEvent.dataTransfer != null)
                {
                    dragEvent.dataTransfer.setData('text/plain', target.id);
                    //dragEvent.dataTransfer.effectAllowed = "move";
                }
                setTimeout(() => {
                    target.classList.add('hide');
                }, 0);
            });

            tileElement.addEventListener('dragend', function(e){
                const target = e.target as Element;
                
                if (target.classList == undefined)
                {
                    return;
                }

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

    public displayPlayerInfo(player: Player) : void
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

        const points = document.getElementById(`player${player.id}_points`);
        if (points == null)
        {
            throw new Error(`Can't find player points for player ${player.id}`);
        }
        points.innerText = player.points.toString();
    }

    public setActivePlayer(player: Player) : void
    {
        const player_rack = document.getElementById(`player${player.id}_rack`);
        const active_rack = document.getElementById(`active_player_rack`);
        if ( (player_rack == null) || (active_rack == null) )
        {
            throw new Error(`Can't find rack!`);
        }

        active_rack.innerHTML = '';

        this.activeTiles.clear();

        player.rack.forEach((tile) => {
            document.getElementById(`game_tile_${tile.id}`)?.remove();
            active_rack.appendChild(this.createTile(tile, true, true));
            this.activeTiles.set(tile.id, tile);
        });
    }

    public logMoveDetails(player: Player, points: number, placedWords: WordInfo[]) : void
    {
        const header = Utils.getTranslation(Constants.Languages.Hebrew, 
                                          Constants.Strings.PlayerInfoTitle).replace("${name}", player.name);
        const subheader = Utils.getTranslation(Constants.Languages.Hebrew, 
                                             Constants.Strings.PlayerInfoPoints).replace("${points}", points.toString());

        const list = document.createElement('ul');
        list.style.margin = "10px";
        placedWords.forEach((wordInfo) => {
            const listItem = document.createElement('li');
            const wordPoints = Utils.getTranslation(Constants.Languages.Hebrew, 
                                                    Constants.Strings.PlayerInfoPoints).replace("${points}", wordInfo.points.toString());
            const textNode = document.createTextNode(`${wordInfo.word}: ${wordPoints}`);
            listItem.appendChild(textNode);
            list.appendChild(listItem);
        });

        const toast = new BootstrapToast(header, subheader, list, 10000);
        toast.show();
        console.log(toast);
    }
}

class BootstrapToast 
{
    private readonly header: string;
    private readonly secondaryHeader: string;
    private readonly body: HTMLElement;
    private readonly delay: number;
    
    constructor(header: string, secondaryHeader: string, body: HTMLElement, delay: number = 5000) 
    {
        this.body = body;
        this.header = header;
        this.secondaryHeader = secondaryHeader;
        this.delay = delay;
    }
    
    public show(): void 
    {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        const header = this.header ? `<div class="toast-header"><strong class="me-auto">` + 
                                        `${this.header}</strong><small>${this.secondaryHeader}</small>` + 
                                        `<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>` + 
                                        `</div>` : '';
        const body = `<div class="toast-body">${this.body}</div>`;
        toast.innerHTML = `${header}`;
        toast.appendChild(this.body);
        
        const toastContainer = this.getOrCreateToastWrapper();
        toastContainer.appendChild(toast);
        
        const bootstrapToast = bootstrap.Toast.getOrCreateInstance(toast, { delay: this.delay });
        bootstrapToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    private getOrCreateToastWrapper() 
    {
        var toastWrapper = document.querySelector<HTMLElement>('body > [data-toast-wrapper]');
        
        if (!toastWrapper) 
        {
            toastWrapper = document.createElement('div');
            toastWrapper.style.zIndex = "11";
            toastWrapper.style.position = 'fixed';
            toastWrapper.style.bottom = "0";
            toastWrapper.style.left = "0";
            toastWrapper.style.padding = '1rem';
            toastWrapper.setAttribute('data-toast-wrapper', '');
            document.body.append(toastWrapper);
        }
        
        return toastWrapper;
    }
}
