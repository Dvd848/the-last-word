import Board from "./Board";
import Player from "./Player";
import Tile from "./Tile";
import { TilePlacement, WordInfo, GameConfiguration } from "./Game";
import * as Constants from "./Constants"
import * as Utils from "./Utils"

import * as bootstrap from 'bootstrap';

export interface DisplayCallBacks
{
    endTurn:            (tile_placements: TilePlacement[]) => void;
    getConfiguration:    () => GameConfiguration;
    setConfiguration:    (config: GameConfiguration) => void;
}

function getStr(id: Constants.Strings) : string
{
    return Utils.getTranslation(Constants.DefaultLanguage, id);
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
        const that = this;

        // End turn button

        const endTurnButton = document.getElementById("end_turn_button")!;
        endTurnButton.innerText = getStr(Constants.Strings.EndTurn);
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
        });

        // Configuration menu

        const showConfigMenu = document.getElementById("showConfigMenu")!;
        const configPlayer1Name = document.getElementById("configPlayer1Name") as HTMLInputElement;
        const configPlayer2Name = document.getElementById("configPlayer2Name") as HTMLInputElement;
        const configCheckDict = document.getElementById("configCheckDict") as HTMLInputElement;
        const configModal = new bootstrap.Modal('#configModal');

        showConfigMenu.addEventListener('click', function(e) {
            const config = that.callbacks.getConfiguration();

            configPlayer1Name.value = config.player1Name;
            configPlayer2Name.value = config.player2Name;

            configCheckDict.checked = config.checkDict;

            configModal.show();
        });

        const configOkButton = document.getElementById("configOkButton")!;
        configOkButton.addEventListener("click", function(e) {

            that.callbacks.setConfiguration({
                player1Name: configPlayer1Name.value,
                player2Name: configPlayer2Name.value,
                checkDict: configCheckDict.checked
            });
            configModal.hide();
        });
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

    public setPlayerNames(players: Player[])
    {
        players.forEach((player) => {
            let name = document.getElementById(`player${player.id}_name`)!;
            name.innerText = player.name;
        });
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

    public logMoveDetails(player: Player, points: number, placedWords: WordInfo[], bonusPoints: number) : void
    {
        const header = getStr(Constants.Strings.PlayerInfoTitle).replace("${name}", player.name);
        const subheader = getStr(Constants.Strings.PlayerInfoPoints).replace("${points}", points.toString());

        let content : HTMLElement;
        if (placedWords.length > 0)
        {
            const list = document.createElement('ul');
            list.style.margin = "10px";
            const addListItem = (numPoints:number, description: string) => {
                const listItem = document.createElement('li');
                const wordPoints = getStr(Constants.Strings.PlayerInfoPoints).replace("${points}", numPoints.toString());
                const textNode = document.createTextNode(`${description}: ${wordPoints}`);
                listItem.appendChild(textNode);
                list.appendChild(listItem);
            }

            placedWords.forEach((wordInfo) => {
                let word = wordInfo.word;
                let lastChar = word.slice(-1);
                if (Utils.isKeyOfObject(lastChar, Constants.lastLetterTranslations[Constants.DefaultLanguage]))
                {
                    word = word.slice(0, -1) + Constants.lastLetterTranslations[Constants.DefaultLanguage][lastChar];
                }
                addListItem(wordInfo.points, word);
            });

            if (bonusPoints > 0)
            {
                addListItem(bonusPoints, getStr(Constants.Strings.Bonus));
            }
            content = list;
        }
        else
        {
            content = document.createElement("p");
            content.appendChild(document.createTextNode(getStr(Constants.Strings.PlayerSkippedMove)));
        }

        const toast = new BootstrapToast(header, subheader, content, 10000);
        toast.show();
    }

    public showError(message: string) : void 
    {
        const myWarningModal = new BootstrapWarningModal('move-warning-modal', getStr(Constants.Strings.Error), message);
        myWarningModal.openModal();
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
        
        const toastHeader = document.createElement('div');
        toastHeader.classList.add('toast-header');

        const strong = document.createElement('strong');
        strong.classList.add('me-auto');
        strong.textContent = this.header;

        const small = document.createElement('small');
        small.textContent = this.secondaryHeader;

        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn-close');
        button.dataset.bsDismiss = 'toast';
        button.setAttribute('aria-label', 'Close');

        toastHeader.appendChild(strong);
        toastHeader.appendChild(small);
        toastHeader.appendChild(button);

        const body = document.createElement('div');
        body.classList.add("toast-body");
        body.appendChild(this.body);
        toast.appendChild(toastHeader);
        toast.appendChild(body);
        
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


class BootstrapWarningModal {
    private readonly modalId: string;
    private readonly modalTitle: string;
    private readonly modalMessage: string;
    
    constructor(modalId: string, modalTitle: string, modalMessage: string) {
        this.modalId = modalId;
        this.modalTitle = modalTitle;
        this.modalMessage = modalMessage;
    }
    
    public openModal(): void {
        const modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.setAttribute('id', this.modalId);
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', `${this.modalId}-title`);
        modal.setAttribute('aria-hidden', 'true');
        
        const modalDialog = document.createElement('div');
        modalDialog.classList.add('modal-dialog', 'modal-dialog-centered');
        
        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');
        
        const modalHeader = document.createElement('div');
        modalHeader.classList.add('modal-header', 'bg-danger', 'text-white');
        
        const modalTitle = document.createElement('h5');
        modalTitle.classList.add('modal-title');
        modalTitle.setAttribute('id', `${this.modalId}-title`);
        modalTitle.textContent = this.modalTitle;
        
        const modalBody = document.createElement('div');
        modalBody.classList.add('modal-body');
        modalBody.textContent = this.modalMessage;
        
        const modalFooter = document.createElement('div');
        modalFooter.classList.add('modal-footer');
        
        const closeButton = document.createElement('button');
        closeButton.setAttribute('type', 'button');
        closeButton.classList.add('btn', 'btn-secondary');
        closeButton.setAttribute('data-bs-dismiss', 'modal');
        closeButton.textContent = getStr(Constants.Strings.Close);
        
        modalHeader.appendChild(modalTitle);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalFooter.appendChild(closeButton);
        modalContent.appendChild(modalFooter);
        modalDialog.appendChild(modalContent);
        modal.appendChild(modalDialog);
        
        document.body.appendChild(modal);
        
        const bsModal = new bootstrap.Modal(modal, {
            backdrop: true,
            keyboard: true
        });
        
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
}
  