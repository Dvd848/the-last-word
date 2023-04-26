import Bag from "./Bag";
import { TilePlacement } from "./Game";
import Tile from "./Tile";
import {Board} from "./Board";
import Dictionary from "./Dictionary";
import * as Constants from "./Constants"

export enum PlayerType {
    Human = "Human",
    Computer = "Computer"
}

export abstract class Player
{
    private     _name        :   string;
    private     _id          :   number;
    private     maxTileNum   :   number;
    private     _rack        :   Set<Tile>;
    private     _points      :   number;
    private     _playerType  :   PlayerType;

    protected constructor(name: string, id: number, maxTileNum: number, playerType: PlayerType)
    {
        this._name = name;
        this._id = id;
        this.maxTileNum = maxTileNum;
        this._points = 0;
        this._rack = new Set<Tile>();
        this._playerType = playerType;
    }

    public fillRack(bag: Bag) : void
    {
        while ( (this._rack.size < this.maxTileNum) && (bag.length > 0) )
        {
            this._rack.add(bag.draw()!);
        }
    }

    public setRack(tiles: Tile[]) : void
    {
        this._rack = new Set<Tile>();
        tiles.forEach((tile) => {
            this._rack.add(tile);
        });
    }

    public removeTile(tile: Tile) : void
    {
        this._rack.delete(tile);
    }

    get rack() : Tile[]
    {
        return [...this._rack];
    }

    get id() : number
    {
        return this._id;
    }

    get name() : string
    {
        return this._name;
    }

    set name(value: string)
    {
        this._name = value;
    }

    get points() : number
    {
        return this._points;
    }

    set points(value: number)
    {
        if (value < 0)
        {
            throw "Points must be non-negative";
        }

        this._points = value;
    }

    get playerType() : PlayerType
    {
        return this._playerType;
    }

    public abstract getMove() : TilePlacement[];

    public abstract automaticMode() : boolean;

    public static createPlayer(name: string, id: number, maxTileNum: number, dictionary: Dictionary, board: Board, playerType: PlayerType) : Player
    {
        switch(playerType)
        {
            case (PlayerType.Computer):
                return new ComputerPlayer(name, id, maxTileNum, dictionary, board);
            case (PlayerType.Human):
                return new HumanPlayer(name, id, maxTileNum);
            default:
                throw new Error(`Unknown player type '${playerType}!`);
        }
    }
}

export class HumanPlayer extends Player
{
    constructor(name: string, id: number, maxTileNum: number)
    {
        super(name, id, maxTileNum, PlayerType.Human);
    }

    public getMove() : TilePlacement[]
    {
        throw new Error("Not implemented!");
    }

    public automaticMode() : boolean
    {
        return false;
    }
}

const enum Direction 
{
    ACROSS,
    DOWN
}

export class ComputerPlayer extends Player
{

    private crossCheckResults   : Map<number, Set<string>>;
    private direction           : Direction;
    private shadowRack          : Map<string, number>;
    private tilePlacements      : TilePlacement[][];
    private dictionary          : Dictionary;
    private board               : Board;

    constructor(name: string, id: number, maxTileNum: number, dictionary : Dictionary, board: Board)
    {
        super(name, id, maxTileNum, PlayerType.Computer);
        this.dictionary = dictionary;
        this.board = board;
        this.crossCheckResults = new Map<number, Set<string>>();
        this.direction = Direction.DOWN;
        this.shadowRack = new Map<string, number>();
        this.tilePlacements = [];
    }

    private before(coordinate: [number, number]) : [number, number]
    {
        let [row, col] = coordinate;
        if (this.direction == Direction.ACROSS)
        {
            return [row, col - 1];
        }
        return [row - 1, col];
    }

    private after(coordinate: [number, number]) : [number, number]
    {
        let [row, col] = coordinate;
        if (this.direction == Direction.ACROSS)
        {
            return [row, col + 1];
        }
        return [row + 1, col];
    }

    private beforeCross(coordinate: [number, number]) : [number, number]
    {
        let [row, col] = coordinate;
        if (this.direction == Direction.ACROSS)
        {
            return [row - 1, col];
        }
        return [row, col - 1];
    }

    private afterCross(coordinate: [number, number]) : [number, number]
    {
        let [row, col] = coordinate;
        if (this.direction == Direction.ACROSS)
        {
            return [row + 1, col];
        }
        return [row, col + 1];
    }

    private wordFound(word: string, lastPosition: [number, number]) : void
    {
        //console.log('Found a word: ', word);
        let playPosition = lastPosition;
        let wordIndex = word.length - 1;
        let tilePlacements : TilePlacement[] = [];
        let rack : Record<string, Tile[]> = {};
        this.rack.forEach((tile) => {
            if (typeof(rack[tile.letter]) == "undefined" )
            {
                rack[tile.letter] = [];
            }
            rack[tile.letter].push(tile);
        })
        while (wordIndex >= 0)
        {
            if (this.board.isTileEmpty(...playPosition))
            {
                let tile = rack[word[wordIndex]].slice(-1)[0];
                let tilePlacement = {r : playPosition[0], c: playPosition[1], tile: tile};
                rack[word[wordIndex]].pop();
                tilePlacements.push(tilePlacement);
            }
            wordIndex -= 1;
            playPosition = this.before(playPosition);
        }
        this.tilePlacements.push(tilePlacements);
    }

    private isLegalAndFilled(coordinate: [number, number]) : boolean
    {
        let [row, col] = coordinate;
        return this.board.isTileInBoard(row, col) && !this.board.isTileEmpty(row, col);
    }

    private isLegalAndEmpty(coordinate: [number, number]) : boolean
    {
        let [row, col] = coordinate;
        return this.board.isTileInBoard(row, col) && this.board.isTileEmpty(row, col);
    }

    private index2Dto1D(row: number, col: number) : number
    {
        return (row * this.board.width) + col;
    }

    private index1Dto2D(index: number) : [number, number]
    {
        let col = index % this.board.width;
        let row = Math.floor(index / this.board.width);
        return [row, col];
    }

    private crossCheck() : Map<number, Set<string>>
    {
        let result = new Map<number, Set<string>>();
        for (let r = 0; r < this.board.height; r++)
        {
            for (let c = 0; c < this.board.width; c++)
            {
                let pos : [number, number] = [r, c];
                if (this.isLegalAndFilled(pos))
                {
                    continue;
                }

                let lettersBefore = "";
                let scanPosition = pos;

                while (this.isLegalAndFilled(this.beforeCross(scanPosition)))
                {
                    scanPosition = this.beforeCross(scanPosition)
                    lettersBefore = this.board.getTile(...scanPosition)!.letter + lettersBefore
                }

                let lettersAfter = "";
                scanPosition = pos;

                while (this.isLegalAndFilled(this.afterCross(scanPosition)))
                {
                    scanPosition = this.afterCross(scanPosition);
                    lettersAfter = lettersAfter + this.board.getTile(...scanPosition)!.letter;
                }

                let potentialLetters : Set<string>;

                if (lettersBefore.length == 0 && lettersAfter.length == 0)
                {
                    potentialLetters = this.dictionary.alphabet;
                }
                else
                {
                    potentialLetters = new Set();
                    for (let letter of this.dictionary.alphabet)
                    {
                        let word_formed = lettersBefore + letter + lettersAfter;
                        if (this.dictionary.contains(word_formed))
                        {
                            potentialLetters.add(letter);
                        }
                    }
                }

                result.set(this.index2Dto1D(...pos), potentialLetters);
            }
        }
        
        return result;
    }

    private findAnchors() : Set<number>
    {
        let anchors = new Set<number>();
        for (let r = 0; r < this.board.height; r++)
        {
            for (let c = 0; c < this.board.width; c++)
            {
                let position : [number, number] = [r, c];
                let isEmpty = this.isLegalAndEmpty(position);
                let isNeighborFilled = this.isLegalAndFilled(this.before(position)) ||
                                this.isLegalAndFilled(this.after(position)) ||
                                this.isLegalAndFilled(this.beforeCross(position)) ||
                                this.isLegalAndFilled(this.afterCross(position));

                if (isEmpty && isNeighborFilled)
                {
                    anchors.add(this.index2Dto1D(...position));
                }
            }
        }
        return anchors
    }

    private beforePart(partialWord : string, anchorPosition : [number, number], limit : number)
    {
        this.extendAfter(partialWord, anchorPosition, false);
        if (limit > 0)
        {
            for (let next_letter of this.dictionary.edges(partialWord))
            {
                const next_letter_count = this.shadowRack.get(next_letter) ?? 0;
                if (next_letter_count > 0)
                {
                    this.shadowRack.set(next_letter, next_letter_count - 1);
                    this.beforePart(partialWord + next_letter, anchorPosition, limit - 1);
                    this.shadowRack.set(next_letter, next_letter_count);
                }
            }
        }
    }

    private extendAfter(partialWord: string, nextPosition: [number, number], isAnchorFilled: boolean) : void
    {
        if (!this.isLegalAndFilled(nextPosition) && this.dictionary.contains(partialWord) && isAnchorFilled)
        {
            this.wordFound(partialWord, this.before(nextPosition));
        }

        if (this.board.isTileInBoard(...nextPosition))
        {
            if (this.board.isTileEmpty(...nextPosition))
            {
                let next_arr = this.dictionary.alphabet;
                if (partialWord != "")
                {
                    next_arr = this.dictionary.edges(partialWord);
                }

                next_arr.forEach((nextLetter: string) => {
                    const next_letter_count = this.shadowRack.get(nextLetter) ?? 0;
                    if (next_letter_count > 0)
                    {
                        let crossCheck = this.crossCheckResults.get(this.index2Dto1D(...nextPosition));
                        if (crossCheck && crossCheck.has(nextLetter))
                        {
                            this.shadowRack.set(nextLetter, next_letter_count - 1);
                            this.extendAfter(partialWord + nextLetter, this.after(nextPosition), true);
                            this.shadowRack.set(nextLetter, next_letter_count);
                        }
                    }
                });
            }
            else
            {
                let existing_letter = this.board.getTile(...nextPosition)!.letter;
                let edges = this.dictionary.edges(partialWord);
                if (edges.has(existing_letter))
                {
                    this.extendAfter(partialWord + existing_letter, this.after(nextPosition), true);
                }
            }
        }
    }

    private findAllMoves() : void
    {        
        for (let direction of [Direction.ACROSS, Direction.DOWN])
        {
            this.direction = direction;
            let anchors : Set<number>;
            if (this.board.isTileEmpty(Constants.CENTER_TILE_ROW, Constants.CENTER_TILE_COL))
            {
                anchors = new Set<number>([this.index2Dto1D(Constants.CENTER_TILE_ROW, Constants.CENTER_TILE_COL)]);
            }
            else
            {
                anchors = this.findAnchors();
            }
            this.crossCheckResults = this.crossCheck();
            anchors.forEach((anchorPosition) => {
                if (this.isLegalAndFilled(this.before(this.index1Dto2D(anchorPosition))))
                {
                    let scan_pos = this.before(this.index1Dto2D(anchorPosition));
                    let partial_word = this.board.getTile(...scan_pos)!.letter;
                    while (this.isLegalAndFilled(this.before(scan_pos)))
                    {
                        scan_pos = this.before(scan_pos)
                        partial_word = this.board.getTile(...scan_pos)!.letter + partial_word;
                    }
                    let edges = this.dictionary.edges(partial_word);
                    if (edges.size > 0)
                    {
                        this.extendAfter(
                            partial_word,
                            this.index1Dto2D(anchorPosition),
                            false
                        );
                    }
                }
                else
                {
                    let limit = 0;
                    let scan_pos = this.index1Dto2D(anchorPosition);
                    while (this.isLegalAndEmpty(this.before(scan_pos)) && !anchors.has(this.index2Dto1D(...this.before(scan_pos))))
                    {
                        limit = limit + 1
                        scan_pos = this.before(scan_pos)
                    }
                    this.beforePart("", this.index1Dto2D(anchorPosition), limit);
                }
            });
        }
    }

    public getMove() : TilePlacement[]
    {
        this.tilePlacements = [];

        this.shadowRack = new Map<string, number>();
        this.rack.forEach((tile) => {
            const count = this.shadowRack.get(tile.letter) ?? 0;
            this.shadowRack.set(tile.letter, count + 1);
        })

        this.findAllMoves();
        if (this.tilePlacements.length == 0)
        {
            return [];
        }

        return this.tilePlacements[Math.floor(Math.random() * this.tilePlacements.length)];
    }

    public automaticMode() : boolean
    {
        return true;
    }
}