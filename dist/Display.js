import * as Constants from "./Constants.js";
import * as Utils from "./Utils.js";
export class Display {
    constructor(board, callbacks) {
        this.board = document.getElementById("board");
        this.activeTiles = new Map();
        this.callbacks = callbacks;
        this.createBoard(board);
    }
    show() {
        document.getElementById("game").classList.remove("hide");
        document.getElementById("loader").remove();
    }
    createBoard(board) {
        this.board.innerHTML = '';
        for (let r = 0; r < board.height; r++) {
            for (let c = 0; c < board.width; c++) {
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
    attachEvents() {
        this.makeBoardDroppable();
        this.makeElementDroppable(document.getElementById("active_player_rack"));
        this.configureButtons();
    }
    configureButtons() {
        const endTurnButton = document.getElementById("end_turn_button");
        const that = this;
        endTurnButton.innerText = Utils.getTranslation(Constants.DefaultLanguage, Constants.Strings.EndTurn);
        endTurnButton.addEventListener('click', function (e) {
            const tilePlacements = [];
            const activeTiles = document.querySelectorAll(".active_tile");
            activeTiles.forEach((activeTile) => {
                const parent = activeTile.parentElement;
                if (parent === null || parent === void 0 ? void 0 : parent.classList.contains("board_tile")) {
                    const tileId = parseInt(activeTile.id.replace("game_tile_", ""));
                    tilePlacements.push({
                        tile: that.activeTiles.get(tileId),
                        r: parseInt(parent.dataset.r),
                        c: parseInt(parent.dataset.c)
                    });
                }
            });
            that.callbacks.endTurn(tilePlacements);
        });
    }
    finalizePlacements() {
        const activeTiles = document.querySelectorAll(".active_tile");
        activeTiles.forEach((activeTile) => {
            activeTile.classList.remove("active_tile");
            activeTile.classList.remove('grabbable');
            activeTile.setAttribute("draggable", "false");
        });
    }
    makeElementDroppable(element) {
        element.classList.add('droppable');
        element.addEventListener('dragenter', function (e) {
            const target = e.target;
            if (target.classList == undefined) {
                return;
            }
            e.preventDefault();
            target.classList.add('drag-over');
        });
        element.addEventListener('dragover', function (e) {
            const target = e.target;
            if (target.classList == undefined) {
                return;
            }
            e.preventDefault();
            target.classList.add('drag-over');
        });
        element.addEventListener('dragleave', function (e) {
            const target = e.target;
            if (target.classList == undefined) {
                return;
            }
            e.preventDefault();
            target.classList.remove('drag-over');
        });
        element.addEventListener('drop', function (e) {
            const target = e.target;
            const dragEvent = e;
            if (target.classList == undefined) {
                return;
            }
            target.classList.remove('drag-over');
            if (!target.classList.contains("droppable")) {
                return;
            }
            if (dragEvent.dataTransfer == null) {
                return;
            }
            const id = dragEvent.dataTransfer.getData('text/plain');
            const draggable = document.getElementById(id);
            if (draggable == null) {
                return;
            }
            target.appendChild(draggable);
            draggable.classList.remove('hide');
        });
    }
    makeBoardDroppable() {
        const tiles = document.querySelectorAll('.board_tile');
        tiles.forEach(tile => {
            this.makeElementDroppable(tile);
        });
    }
    createTile(tile, is_draggable, is_active) {
        const tileElement = document.createElement('div');
        const letter = document.createTextNode(tile.letter);
        tileElement.classList.add('game_tile');
        if (is_draggable) {
            tileElement.classList.add('grabbable');
            tileElement.setAttribute("draggable", "true");
            tileElement.addEventListener('dragstart', function (e) {
                const target = e.target;
                const dragEvent = e;
                if (target.classList == undefined) {
                    return;
                }
                if (dragEvent.dataTransfer != null) {
                    dragEvent.dataTransfer.setData('text/plain', target.id);
                    //dragEvent.dataTransfer.effectAllowed = "move";
                }
                setTimeout(() => {
                    target.classList.add('hide');
                }, 0);
            });
            tileElement.addEventListener('dragend', function (e) {
                const target = e.target;
                if (target.classList == undefined) {
                    return;
                }
                target.classList.remove('hide');
            });
        }
        if (is_active) {
            tileElement.classList.add("active_tile");
        }
        tileElement.appendChild(letter);
        tileElement.setAttribute("id", `game_tile_${tile.id}`);
        const pointsElement = document.createElement('div');
        const points = document.createTextNode(tile.points.toString());
        pointsElement.classList.add('points');
        pointsElement.appendChild(points);
        tileElement.appendChild(pointsElement);
        return tileElement;
    }
    displayPlayerInfo(player) {
        const rack = document.getElementById(`player${player.id}_rack`);
        if (rack == null) {
            throw new Error(`Can't find player rack for player ${player.id}`);
        }
        rack.innerHTML = '';
        player.rack.forEach((tile) => {
            rack.appendChild(this.createTile(tile, false, false));
        });
        const points = document.getElementById(`player${player.id}_points`);
        if (points == null) {
            throw new Error(`Can't find player points for player ${player.id}`);
        }
        points.innerText = player.points.toString();
    }
    setActivePlayer(player) {
        const player_rack = document.getElementById(`player${player.id}_rack`);
        const active_rack = document.getElementById(`active_player_rack`);
        if ((player_rack == null) || (active_rack == null)) {
            throw new Error(`Can't find rack!`);
        }
        active_rack.innerHTML = '';
        this.activeTiles.clear();
        player.rack.forEach((tile) => {
            var _a;
            (_a = document.getElementById(`game_tile_${tile.id}`)) === null || _a === void 0 ? void 0 : _a.remove();
            active_rack.appendChild(this.createTile(tile, true, true));
            this.activeTiles.set(tile.id, tile);
        });
    }
}
