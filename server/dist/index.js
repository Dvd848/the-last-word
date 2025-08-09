// src/index.ts
import express from "express";
import path2 from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";
import { Server } from "socket.io";

// ../shared/src/Tile.ts
var counter = 0;
var Tile = class _Tile {
  _letter;
  _points;
  _id;
  constructor(letter, points) {
    this._letter = letter;
    this._points = points;
    this._id = counter++;
  }
  /**
   * Returns the letter for this tile
   */
  get letter() {
    return this._letter;
  }
  /**
   * Returns the points for this tile
   */
  get points() {
    return this._points;
  }
  /**
   * Returns the tile ID
   */
  get id() {
    return this._id;
  }
  /**
   * Is this tile equal to another tile?
   * @param other Other tile
   * @returns True if the tiles are equal, false otherwise
   */
  equals(other) {
    return this.letter == other.letter && this.points == other.points && this.id == other.id;
  }
  static fromJson(data) {
    const tile = new _Tile(data._letter, data._points);
    tile._id = data._id;
    return tile;
  }
};

// ../shared/src/BoardTile.ts
var BoardTile = class _BoardTile {
  _row;
  _col;
  _tile;
  _type;
  _wordMul;
  _letterMul;
  /**
   * Constructor for BoardTile class
   * @param row - row number of the tile
   * @param col - column number of the tile
   */
  constructor(row, col) {
    this._row = row;
    this._col = col;
    this._tile = null;
    this._type = "Regular" /* Regular */;
    this._wordMul = 1;
    this._letterMul = 1;
  }
  /**
   * Getter for row property
   * @returns row number of the tile
   */
  get row() {
    return this._row;
  }
  /**
   * Getter for col property
   * @returns column number of the tile
   */
  get col() {
    return this._col;
  }
  /**
   * Getter for tile property
   * @returns Tile object or null if there is no tile on this board tile
   */
  get tile() {
    return this._tile;
  }
  /**
   * Setter for tile property
   * @param tile - Tile object to be set on this board tile
   */
  set tile(tile) {
    this._tile = tile;
  }
  /**
   * Getter for type property
   * @returns type of this board tile (Regular, DoubleLetter, TripleLetter, DoubleWord, TripleWord)
   */
  get type() {
    return this._type;
  }
  /**
   * Setter for type property
   * @param type - type of this board tile (Regular, DoubleLetter, TripleLetter, DoubleWord, TripleWord)
   */
  set type(type) {
    this._type = type;
  }
  /**
   * Getter for wordMultiplier property - the score for a word placed on this tile is multiplied by this factor
   * @returns word multiplier value of this board tile
   */
  get wordMultiplier() {
    return this._wordMul;
  }
  /**
   * Setter for wordMultiplier property - the score for a word placed on this tile is multiplied by this factor
   * @param value - word multiplier value to be set on this board tile
   */
  set wordMultiplier(value2) {
    this._wordMul = value2;
  }
  /**
   * Getter for letterMultiplier property - the score for a letter placed on this tile is multiplied by this factor
   * @returns letter multiplier value of this board tile (1 or 2 or 3)
   */
  get letterMultiplier() {
    return this._letterMul;
  }
  /**
   * Setter for letterMultiplier property -  - the score for a letter placed on this tile is multiplied by this factor
   * @param value - letter multiplier value to be set on this board tile (1 or 2 or 3)
   */
  set letterMultiplier(value2) {
    this._letterMul = value2;
  }
  /**
   * Disables both word and letter multipliers by setting them to 1.
   */
  disableMultiplier() {
    this._wordMul = 1;
    this._letterMul = 1;
  }
  static fromJson(data) {
    const tile = new _BoardTile(data._row, data._col);
    tile.type = data._type;
    tile.wordMultiplier = data._wordMul;
    tile.letterMultiplier = data._letterMul;
    if (data._tile !== null) {
      tile.tile = Tile.fromJson(data._tile);
    } else {
      tile.tile = null;
    }
    return tile;
  }
};

// ../shared/src/Constants.ts
var BOARD_DIMENSIONS = 15;
var TILES_PER_PLAYER = 7;
var CENTER_TILE_ROW = 7;
var CENTER_TILE_COL = 7;
var BINGO_BONUS_POINTS = 50;
var MAX_CONSECUTIVE_PASS = 6;
var DefaultLanguage = "Hebrew" /* Hebrew */;
var gameTiles = {
  ["Hebrew" /* Hebrew */]: [
    { letter: "\u05D0", count: 9, points: 1 },
    { letter: "\u05D1", count: 2, points: 2 },
    { letter: "\u05D2", count: 3, points: 2 },
    { letter: "\u05D3", count: 3, points: 2 },
    { letter: "\u05D4", count: 13, points: 1 },
    { letter: "\u05D5", count: 4, points: 2 },
    { letter: "\u05D6", count: 1, points: 5 },
    { letter: "\u05D7", count: 2, points: 3 },
    { letter: "\u05D8", count: 1, points: 5 },
    { letter: "\u05D9", count: 8, points: 1 },
    { letter: "\u05DB", count: 4, points: 2 },
    { letter: "\u05DC", count: 4, points: 1 },
    { letter: "\u05DE", count: 4, points: 2 },
    { letter: "\u05E0", count: 5, points: 1 },
    { letter: "\u05E1", count: 2, points: 2 },
    { letter: "\u05E2", count: 5, points: 1 },
    { letter: "\u05E4", count: 4, points: 2 },
    { letter: "\u05E6", count: 2, points: 3 },
    { letter: "\u05E7", count: 1, points: 4 },
    { letter: "\u05E8", count: 6, points: 1 },
    { letter: "\u05E9", count: 7, points: 1 },
    { letter: "\u05EA", count: 5, points: 1 }
    //TODO: { letter: " ", count: 2 ,points: 0 }
  ],
  ["English" /* English */]: [
    { letter: "A", count: 9, points: 1 },
    { letter: "B", count: 2, points: 3 },
    { letter: "C", count: 2, points: 3 },
    { letter: "D", count: 4, points: 2 },
    { letter: "E", count: 12, points: 1 },
    { letter: "F", count: 2, points: 4 },
    { letter: "G", count: 3, points: 2 },
    { letter: "H", count: 2, points: 4 },
    { letter: "I", count: 9, points: 1 },
    { letter: "J", count: 1, points: 8 },
    { letter: "K", count: 1, points: 5 },
    { letter: "L", count: 4, points: 1 },
    { letter: "M", count: 2, points: 3 },
    { letter: "N", count: 6, points: 1 },
    { letter: "O", count: 8, points: 1 },
    { letter: "P", count: 2, points: 3 },
    { letter: "Q", count: 1, points: 10 },
    { letter: "R", count: 6, points: 1 },
    { letter: "S", count: 4, points: 1 },
    { letter: "T", count: 6, points: 1 },
    { letter: "U", count: 4, points: 1 },
    { letter: "V", count: 2, points: 4 },
    { letter: "W", count: 2, points: 4 },
    { letter: "X", count: 1, points: 8 },
    { letter: "Y", count: 2, points: 4 },
    { letter: "Z", count: 1, points: 10 }
    //TODO: { letter: " ", count: 2,  points: 0 }
  ]
};
var tileMultipliers = {
  ["DoubleWord" /* DoubleWord */]: {
    wordMul: 2,
    letterMul: 1,
    coordinates: [
      { row: 1, col: 1 },
      { row: 2, col: 2 },
      { row: 3, col: 3 },
      { row: 4, col: 4 },
      { row: 10, col: 10 },
      { row: 11, col: 11 },
      { row: 12, col: 12 },
      { row: 13, col: 13 },
      { row: 1, col: 13 },
      { row: 2, col: 12 },
      { row: 3, col: 11 },
      { row: 4, col: 10 },
      { row: 10, col: 4 },
      { row: 11, col: 3 },
      { row: 12, col: 2 },
      { row: 13, col: 1 }
    ]
  },
  ["DoubleLetter" /* DoubleLetter */]: {
    wordMul: 1,
    letterMul: 2,
    coordinates: [
      { row: 0, col: 3 },
      { row: 0, col: 11 },
      { row: 2, col: 6 },
      { row: 2, col: 8 },
      { row: 3, col: 0 },
      { row: 3, col: 7 },
      { row: 3, col: 14 },
      { row: 6, col: 2 },
      { row: 6, col: 6 },
      { row: 6, col: 8 },
      { row: 6, col: 12 },
      { row: 7, col: 3 },
      { row: 7, col: 11 },
      { row: 8, col: 2 },
      { row: 8, col: 6 },
      { row: 8, col: 8 },
      { row: 8, col: 12 },
      { row: 11, col: 0 },
      { row: 11, col: 7 },
      { row: 11, col: 14 },
      { row: 12, col: 6 },
      { row: 12, col: 8 },
      { row: 14, col: 3 },
      { row: 14, col: 11 }
    ]
  },
  ["TripleWord" /* TripleWord */]: {
    wordMul: 3,
    letterMul: 1,
    coordinates: [
      { row: 0, col: 0 },
      { row: 0, col: 7 },
      { row: 0, col: 14 },
      { row: 7, col: 0 },
      { row: 7, col: 14 },
      { row: 14, col: 0 },
      { row: 14, col: 7 },
      { row: 14, col: 14 }
    ]
  },
  ["TripleLetter" /* TripleLetter */]: {
    wordMul: 1,
    letterMul: 3,
    coordinates: [
      { row: 1, col: 5 },
      { row: 1, col: 9 },
      { row: 5, col: 1 },
      { row: 5, col: 5 },
      { row: 5, col: 9 },
      { row: 5, col: 13 },
      { row: 9, col: 1 },
      { row: 9, col: 5 },
      { row: 9, col: 9 },
      { row: 9, col: 13 },
      { row: 13, col: 5 },
      { row: 13, col: 9 }
    ]
  },
  ["Regular" /* Regular */]: {
    wordMul: 1,
    letterMul: 1,
    coordinates: []
  },
  ["CenterTile" /* CenterTile */]: {
    wordMul: 2,
    letterMul: 1,
    coordinates: [
      { row: CENTER_TILE_ROW, col: CENTER_TILE_COL }
    ]
  }
};

// ../shared/src/Board.ts
var Board = class _Board {
  _size;
  tiles;
  /**
   * Constructs a new Board object with the specified size, and initializes the special tiles on the board.
   * @param size - The size of the board.
   */
  constructor(size, multipliers) {
    this._size = size;
    this.tiles = new Array(size).fill(null).map(() => new Array(size).fill(null));
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        this.tiles[row][col] = new BoardTile(row, col);
      }
    }
    Object.keys(multipliers).forEach((key, index) => {
      let type = key;
      let wordMul = multipliers[type].wordMul;
      let letterMul = multipliers[type].letterMul;
      multipliers[type].coordinates.forEach((coordinates) => {
        this.tiles[coordinates.row][coordinates.col].type = type;
        this.tiles[coordinates.row][coordinates.col].wordMultiplier = wordMul;
        this.tiles[coordinates.row][coordinates.col].letterMultiplier = letterMul;
      });
    });
  }
  /**
   * Returns a BoardTile object at the specified row and column of the board.
   * @param row - The row of the board.
   * @param col - The column of the board.
   * @returns The BoardTile object at the specified row and column of the board.
   */
  getBoardTileType(row, col) {
    return this.tiles[row][col].type;
  }
  /**
   * Returns a Tile object (or null if it's empty) at the specified row and column of the board.
   * @param row - The row of the board.
   * @param col - The column of the board.
   * @returns The Tile object or null at the specified row and column of the board.
   */
  getTile(row, col) {
    return this.tiles[row][col].tile;
  }
  /**
   * Returns true if the tile at the specified row and column of the board is empty.
   * @param row - The row of the board.
   * @param col - The column of the board.
   * @returns True if the tile at the specified row and column of the board is empty.
   */
  isTileEmpty(row, col) {
    return this.getTile(row, col) == null;
  }
  /**
   * Returns true if the location at the specified row and column of the board is within bounds of the board.
   * @param row - The row of the board.
   * @param col - The column of the board.
   * @returns True if the location at the specified row and column of the board is within bounds of the board.
   */
  isTileInBoard(row, col) {
    return row >= 0 && col >= 0 && row < this.height && col < this.width;
  }
  /**
   * Returns the width of the board.
   * @returns The width of the board.
   */
  get width() {
    return this._size;
  }
  /**
   * Returns the height of the board.
   * @returns The height of the board.
   */
  get height() {
    return this._size;
  }
  static fromJson(data) {
    const board = new _Board(data._size, {});
    for (let row = 0; row < data.tiles.length; row++) {
      for (let col = 0; col < data.tiles[row].length; col++) {
        board.tiles[row][col] = BoardTile.fromJson(data.tiles[row][col]);
      }
    }
    return board;
  }
};
var ModifiableBoard = class extends Board {
  constructor(size, multipliers) {
    super(size, multipliers);
  }
  /**
   * Sets a tile at the specified row and column of the board.
   * @param row - The row of the board.
   * @param col - The column of the board.
   * @param tile - The tile to set at the specified row and column of the board, or null (to remove a tile).
   */
  setTile(row, col, tile) {
    this.tiles[row][col].tile = tile;
  }
  /**
   * Returns a BoardTile object at the specified row and column of the board.
   * @param row - The row of the board.
   * @param col - The column of the board.
   * @returns The BoardTile object at the specified row and column of the board.
   */
  getBoardTile(row, col) {
    return this.tiles[row][col];
  }
};

// ../shared/src/Player.ts
var Player = class {
  _name;
  _id;
  _index;
  maxTileNum;
  _rack;
  _points;
  _playerType;
  constructor(name, id, index, maxTileNum, playerType) {
    this._name = name;
    this._id = id;
    this._index = index;
    this.maxTileNum = maxTileNum;
    this._points = 0;
    this._rack = /* @__PURE__ */ new Set();
    this._playerType = playerType;
  }
  /**
   * Fill the rack with up to maxTileNum from the Bag
   * @param bag The bag to fill the rack from
   */
  fillRack(bag) {
    while (this._rack.size < this.maxTileNum && bag.length > 0) {
      this._rack.add(bag.draw());
    }
  }
  /**
   * Replace the current rack with the provided one
   * @param tiles The tiles to add to the rack
   */
  setRack(tiles) {
    this._rack = /* @__PURE__ */ new Set();
    tiles.forEach((tile) => {
      this._rack.add(tile);
    });
  }
  /**
   * Remove the given tile from the rack
   * @param tile The tile to remove from the rack
   */
  removeTile(tile) {
    for (const elem of this._rack) {
      if (tile.equals(elem)) {
        this._rack.delete(elem);
        return;
      }
    }
  }
  /**
   * Returns true if the player's rack contains the given tile
   * @param tile The tile to check 
   * @returns True if the player's rack contains the given tile
   */
  hasTile(tile) {
    for (const elem of this._rack) {
      if (tile.equals(elem)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Return a copy of the rack
   */
  get rack() {
    return [...this._rack];
  }
  /**
   * Return the player id
   */
  get id() {
    return this._id;
  }
  /**
   * Return the player index
   */
  get index() {
    return this._index;
  }
  /**
   * Return the player name
   */
  get name() {
    return this._name;
  }
  /**
   * Set the player name
   */
  set name(value2) {
    this._name = value2;
  }
  /**
   * Return the player points
   */
  get points() {
    return this._points;
  }
  /**
   * Set the player points
   */
  set points(value2) {
    if (value2 < 0) {
      throw "Points must be non-negative";
    }
    this._points = value2;
  }
  /**
   * Return the player type
   */
  get playerType() {
    return this._playerType;
  }
  /**
   * Factory method to create players.
   * @param name The player name
   * @param id The player number
   * @param maxTileNum The maximum number of tiles for the player rack
   * @param playerType The player type
   * @returns A new player
   */
  static createPlayer(name, id, index, maxTileNum, playerType) {
    switch (playerType) {
      case "Human" /* Human */:
        return new HumanPlayer(name, id, index, maxTileNum);
      default:
        throw new Error(`Unknown player type '${playerType}!`);
    }
  }
  static fromJson(data) {
    switch (data._playerType) {
      case "Human" /* Human */:
        return HumanPlayer.fromJson(data);
      default:
        throw new Error(`Unknown player type '${data._playerType}' in fromJson`);
    }
  }
  static toJson(player) {
    return {
      _name: player.name,
      _id: player.id,
      _index: player.index,
      _points: player.points,
      maxTileNum: player["maxTileNum"],
      _playerType: player.playerType,
      _rack: Array.from(player._rack.values()).map((tile) => ({
        _letter: tile.letter,
        _points: tile.points,
        _id: tile.id
      }))
    };
  }
};
var HumanPlayer = class _HumanPlayer extends Player {
  constructor(name, id, index, maxTileNum) {
    super(name, id, index, maxTileNum, "Human" /* Human */);
  }
  getMove(calculatePoints) {
    throw new Error("Not implemented!");
  }
  automaticMode() {
    return false;
  }
  static fromJson(data) {
    const player = new _HumanPlayer(data._name, data._id, data._index, data.maxTileNum);
    player.points = data._points;
    console.log(data._rack);
    const tiles = data._rack.map((tileJson) => Tile.fromJson(tileJson));
    player.setRack(tiles);
    return player;
  }
};

// ../shared/src/Utils.ts
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ];
  }
  return array;
}

// ../shared/src/Bag.ts
var Bag = class {
  tiles = [];
  tilesById = /* @__PURE__ */ new Map();
  /**
   * Creates an instance of Bag and shuffles it
   * @param tileCounts - An array describing the different tiles, their count and points
   */
  constructor(tileCounts) {
    for (const tileCount of tileCounts) {
      for (let i = tileCount.count; i > 0; i--) {
        const tile = new Tile(tileCount.letter, tileCount.points);
        this.tiles.push(tile);
        this.tilesById.set(tile.id, tile);
      }
    }
    this.shuffle();
  }
  /**
   * Draws a tile from the bag.
   * @returns The drawn tile or null if the bag is empty.
   */
  draw() {
    if (this.tiles.length > 0) {
      return this.tiles.pop();
    }
    return null;
  }
  /**
   * Adds a tile to the bag.
   * @param tile - The tile to add.
   */
  add(tile) {
    this.tiles.push(tile);
  }
  /**
   * Shuffles the tiles in the bag.
   */
  shuffle() {
    this.tiles = shuffle(this.tiles);
  }
  /**
   * Gets the number of tiles in the bag.
   * @returns The number of tiles in the bag.
   */
  get length() {
    return this.tiles.length;
  }
  getTileById(id) {
    const tile = this.tilesById.get(id);
    return tile !== void 0 ? tile : null;
  }
};

// ../shared/src/SharedGame.ts
var UserError = class extends Error {
  extraData;
  type;
  constructor(type, extraData = null) {
    super(`The following error occurred: ${type.toString()}`);
    this.extraData = extraData;
    this.type = type;
  }
};

// src/gameLogic.ts
var ServerGame = class {
  board;
  bag;
  players;
  currentPlayerIndex;
  firstTurnPlayed;
  dictionary;
  checkDict;
  consecutivePasses;
  _isGameOver;
  numPlayers;
  constructor(dictionary, numPlayers) {
    const that = this;
    this.dictionary = dictionary;
    this.numPlayers = numPlayers;
    this.players = [];
    this.newGame();
  }
  /**
   * Starts a new game based on the given configuration
   */
  newGame() {
    this.board = new ModifiableBoard(BOARD_DIMENSIONS, tileMultipliers);
    this.currentPlayerIndex = 0;
    this.bag = new Bag(gameTiles[DefaultLanguage]);
    this.firstTurnPlayed = false;
    this.checkDict = true;
    this.consecutivePasses = 0;
    this._isGameOver = false;
  }
  /**
   * Create the players for the game
   * @param players The player details to use for creating the players
   * @param basedOnCurrent True if the new players should inherit the rack and points from the current players, False otherwise
   * @returns The new players created
   */
  addPlayer(player) {
    let newPlayer = null;
    this.players.forEach((existingPlayer) => {
      if (player.id == existingPlayer.id) {
        newPlayer = existingPlayer;
      }
    });
    if (newPlayer != null) {
      console.log(`Found player ${player.id}`, newPlayer);
      return newPlayer;
    }
    if (this.allPlayersJoined()) {
      throw new Error(`Can't add more than ${this.numPlayers} players`);
    }
    newPlayer = Player.createPlayer(
      player.name,
      player.id,
      this.players.length,
      TILES_PER_PLAYER,
      player.playerType
    );
    newPlayer.fillRack(this.bag);
    this.players.push(newPlayer);
    if (this.allPlayersJoined()) {
      this.currentPlayerIndex = this.players.length - 1;
      this.moveToNextPlayer();
    }
    return newPlayer;
  }
  allPlayersJoined() {
    return this.players.length == this.numPlayers;
  }
  checkWord(word) {
    return this.dictionary.contains(word);
  }
  /**
   * Return the current game configuration
   * @returns The current game configuration
   */
  /*
  public getConfiguration() : GameConfiguration
  {
      return {
          playerDetails: this.players.map(player => {
              return {name: player.name, playerType: player.playerType}
          }),
          checkDict: this.checkDict
      }
  }
  */
  /**
   * Set the current game configuration
   * @param config The configuration to be used
   * @returns True if the configuration was legal, False otherwise
   */
  /*
      private setConfigurationCallback(config: GameConfiguration) : boolean
      {
          try
          {
  
              if (config.playerDetails.length != this.players.length)
              {
                  throw Error("Number of player names should match number of players");
              }
      
              config.playerDetails.forEach((details) => {
                  details.name = details.name.trim();
                  if (details.name == "")
                  {
                      throw Error("Player name can't be empty or only spaces");
                  }
              });
      
              this.checkDict = config.checkDict;
              this.players = this.createPlayers(config.playerDetails, true);
          
              //this.display.setPlayerNames(this.players);
  
              this.playAutoTurnIfNeeded();
      
              return true;
          }
          catch (err)
          {
              return false;
          }
      }
      */
  /**
   * Callback for the Display to check if a given word exists in the dictionary
   * @param word The word to check
   * @returns True if the word exists in the dictionary, False otherwise
   */
  checkWordCallback(word) {
    return this.dictionary.contains(word);
  }
  /**
   * Callback for the Display to swap tiles for the current player
   * @param tiles The tiles to swap
   */
  swapTiles(tiles) {
    if (tiles.length > this.currentPlayer.rack.length) {
      return null;
    }
    const numTiles = Math.min(tiles.length, this.bag.length);
    for (let i = 0; i < numTiles; i++) {
      if (!this.currentPlayer.hasTile(tiles[i])) {
        return null;
      }
    }
    const oldTiles = [];
    for (let i = 0; i < numTiles; i++) {
      this.currentPlayer.removeTile(tiles[i]);
      oldTiles.push(tiles[i]);
    }
    this.currentPlayer.fillRack(this.bag);
    oldTiles.forEach((tile) => {
      this.bag.add(tile);
    });
    this.bag.shuffle();
    this.consecutivePasses += 1;
    const swapDetails = {
      playerIndex: this.currentPlayer.index,
      oldTiles
    };
    this.moveToNextPlayer();
    return swapDetails;
  }
  /**
   * Given a tile placement, return all the word (and points) for the words created as part of this placement
   * @param tilePlacements An array representing the tiles placed on the board
   * @returns The different words (and their matching points) created as part of this placement
   */
  getCreatedWords(tilePlacements) {
    const words = /* @__PURE__ */ new Set();
    const axes = ["r", "c"];
    for (const placement of tilePlacements) {
      for (let axis of axes) {
        let word = "";
        let points = 0;
        let start_index = { r: -1, c: -1 };
        let current = { r: placement.r, c: placement.c };
        while (this.board.isTileInBoard(current["r"], current["c"]) && !this.board.isTileEmpty(current["r"], current["c"])) {
          start_index = { r: current["r"], c: current["c"] };
          current[axis]--;
        }
        current["r"] = start_index.r;
        current["c"] = start_index.c;
        let wordMultiplier = 1;
        while (this.board.isTileInBoard(current["r"], current["c"]) && !this.board.isTileEmpty(current["r"], current["c"])) {
          let tile = this.board.getTile(current["r"], current["c"]);
          let boardTile = this.board.getBoardTile(current["r"], current["c"]);
          word += tile.letter;
          points += tile.points * boardTile.letterMultiplier;
          current[axis]++;
          wordMultiplier *= boardTile.wordMultiplier;
        }
        points *= wordMultiplier;
        if (word.length > 1) {
          words.add(JSON.stringify({ word, start_index, points }));
        }
      }
    }
    return Array.from(words, (JSONEntry) => JSON.parse(JSONEntry));
  }
  /**
   * Calculate the amount of points the player is entitled to as part of the given placement
   * @param tilePlacements An array representing the tiles placed on the board 
   * @param placedWords An array representing the words created as part of this placement
   * @returns A tuple with the amount of points for the word placement and the amount of bonus points for this placement
   */
  calculatePoints(tilePlacements, placedWords) {
    let newPoints = 0;
    let bonusPoints = 0;
    for (const placedWord of placedWords) {
      newPoints += placedWord.points;
    }
    if (tilePlacements.length == TILES_PER_PLAYER) {
      bonusPoints = BINGO_BONUS_POINTS;
    }
    return [newPoints, bonusPoints];
  }
  /**
   * Verify that the given tiles were placed in a consecutive manner
   * @param tilePlacements An array representing the tiles placed on the board 
   * @returns True if the tiles were placed consecutively on the board
   */
  verifyPlacementConsecutive(tilePlacements) {
    if (tilePlacements.length > 0) {
      const rValues = tilePlacements.map((tilePlacement) => tilePlacement.r);
      const cValues = tilePlacements.map((tilePlacement) => tilePlacement.c);
      const rSet = new Set(rValues);
      const cSet = new Set(cValues);
      let axis;
      if (rSet.size === 1) {
        axis = "c";
      } else if (cSet.size === 1) {
        axis = "r";
      } else {
        return false;
      }
      const minMax = tilePlacements.reduce((acc, curr) => {
        let n = curr[axis];
        return [
          Math.min(acc[0], n),
          Math.max(acc[1], n)
        ];
      }, [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]);
      if (rSet.size === 1) {
        for (let c = minMax[0]; c <= minMax[1]; c++) {
          if (this.board.isTileEmpty(rValues[0], c) && !cSet.has(c)) {
            return false;
          }
        }
      } else if (cSet.size === 1) {
        for (let r = minMax[0]; r <= minMax[1]; r++) {
          if (this.board.isTileEmpty(r, cValues[0]) && !rSet.has(r)) {
            return false;
          }
        }
      }
    }
    return true;
  }
  /**
   * Verify that all the tiles placed during this turn are connected legally
   * @param tilePlacements An array representing the tiles placed on the board 
   * @returns True if all the tiles are connected legally
   */
  verifyPlacementConnected(tilePlacements) {
    if (this.firstTurnPlayed && tilePlacements.length > 0) {
      let connected = false;
      for (const tilePlacement of tilePlacements) {
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          let new_r = tilePlacement.r + dr;
          let new_c = tilePlacement.c + dc;
          if (this.board.isTileInBoard(new_r, new_c) && !this.board.isTileEmpty(new_r, new_c)) {
            connected = true;
            break;
          }
        }
      }
      if (!connected) {
        return false;
      }
    }
    return true;
  }
  /**
   * Move to the next player after the current player ended their turn
   */
  moveToNextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }
  /**
   * Callback for the Display to handle the end of a turn
   * @param tilePlacements An array representing the tiles placed on the board 
   * @param forceObjection True if the user requests to override the dictionary check
   */
  endTurnCallback(tilePlacements, forceObjection) {
    const actualTilePlacements = [];
    try {
      if (!this.verifyPlacementConsecutive(tilePlacements)) {
        throw new UserError(0 /* PlacementConsecutive */);
      }
      if (!this.verifyPlacementConnected(tilePlacements)) {
        throw new UserError(1 /* PlacementConnected */);
      }
      for (const tilePlacement of tilePlacements) {
        if (!this.board.isTileEmpty(tilePlacement.r, tilePlacement.c)) {
          throw new UserError(2 /* PlacementExisting */);
        }
        console.log(tilePlacement.tile);
        if (!this.currentPlayer.hasTile(tilePlacement.tile)) {
          throw new UserError(6 /* UserDoesntHaveTile */);
        }
        this.board.setTile(tilePlacement.r, tilePlacement.c, tilePlacement.tile);
        actualTilePlacements.push(tilePlacement);
      }
      const placedWords = this.getCreatedWords(tilePlacements);
      const illegalWords = [];
      if (this.checkDict && !forceObjection) {
        for (const placedWord of placedWords) {
          if (!this.dictionary.contains(placedWord.word)) {
            illegalWords.push(placedWord.word);
          }
        }
      }
      if (illegalWords.length > 0) {
        throw new UserError(3 /* PlacementIllegalWord */, illegalWords);
      }
      if (!this.firstTurnPlayed) {
        if (tilePlacements.length == 1) {
          throw new UserError(4 /* PlacementFirstWordMin */);
        } else if (tilePlacements.length > 0) {
          let centerTileUsed = false;
          tilePlacements.forEach((tilePlacement) => {
            if (tilePlacement.r == CENTER_TILE_ROW && tilePlacement.c == CENTER_TILE_COL) {
              centerTileUsed = true;
            }
          });
          if (!centerTileUsed) {
            throw new UserError(5 /* PlacementFirstWordLocation */);
          }
          this.firstTurnPlayed = true;
        }
      }
      let [newPoints, bonusPoints] = this.calculatePoints(tilePlacements, placedWords);
      this.currentPlayer.points += newPoints + bonusPoints;
      tilePlacements.forEach((tilePlacement) => {
        this.currentPlayer.removeTile(tilePlacement.tile);
        this.board.getBoardTile(tilePlacement.r, tilePlacement.c).disableMultiplier();
      });
      this.currentPlayer.fillRack(this.bag);
      if (tilePlacements.length == 0) {
        this.consecutivePasses += 1;
      } else {
        this.consecutivePasses = 0;
      }
      const MoveDetails2 = {
        playerIndex: this.currentPlayer.index,
        points: newPoints,
        placedWords,
        bonusPoints
      };
      if (this.currentPlayer.rack.length == 0 || this.consecutivePasses == MAX_CONSECUTIVE_PASS) {
        this._isGameOver = true;
      } else {
        this.moveToNextPlayer();
      }
      return MoveDetails2;
    } catch (err) {
      actualTilePlacements.forEach((tilePlacement) => {
        this.board.setTile(tilePlacement.r, tilePlacement.c, null);
      });
      if (err instanceof UserError) {
        throw err;
      } else if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log(err);
      }
      return null;
    }
  }
  /**
   * Returns the leading player at this time, according to the amount of points (or null if there's a tie)
   * @returns The leading player at this time
   */
  getLeadingPlayer() {
    let res = null;
    let tie = true;
    this.players.forEach((player) => {
      if (res == null) {
        res = player;
      } else {
        if (player.points > res.points) {
          res = player;
          tie = false;
        } else if (player.points < res.points) {
          tie = false;
        }
      }
    });
    if (tie) {
      return null;
    }
    return res;
  }
  /**
   * Returns the current player
   */
  get currentPlayer() {
    return this.players[this.currentPlayerIndex];
  }
  isGameOver() {
    return this._isGameOver;
  }
  /**
   * Get a map of the points for each player (player index -> player points)
   * @returns A map of the points for each player
   */
  getPoints() {
    const points = /* @__PURE__ */ new Map();
    this.players.forEach((player) => {
      points.set(player.index, player.points);
    });
    return points;
  }
};

// src/onlineGameManager.ts
import { validate as uuidValidate, version as uuidVersion } from "uuid";
var CLEANUP_DELAY = 5 * 60 * 1e3;
var CLEANUP_INTERVAL = 30 * 60 * 1e3;
var INACTIVITY_THRESHOLD = 60 * 60 * 1e3;
var games = {};
function isValidGameID(gameId) {
  return /^[A-Za-z0-9_-]{1,32}$/.test(gameId);
}
function cleanupInactiveGames() {
  const now = Date.now();
  for (const gameId in games) {
    const game = games[gameId];
    if (now - game.lastActivity > INACTIVITY_THRESHOLD) {
      console.log(`Removing inactive game ${gameId}`);
      delete games[gameId];
    }
  }
}
function generateGameId() {
  return Math.random().toString(36).substring(2, 8);
}
function createNewGame(dictionary, gameId) {
  if (Object.keys(games).length > 100) {
    throw new Error(`Max number of supported games reached!`);
  }
  if (gameId == null) {
    gameId = generateGameId();
  }
  const game = {
    serverGame: new ServerGame(dictionary, 2),
    isMarkedForDelete: false,
    lastActivity: Date.now()
  };
  game.serverGame.newGame();
  games[gameId] = game;
  console.log(`New game created: ${gameId}`);
  return gameId;
}
function checkGameId(gameId) {
  return gameId in games;
}
function onlineGameManager(io, dictionary) {
  console.log("onlineGameManager initialized");
  setInterval(cleanupInactiveGames, CLEANUP_INTERVAL);
  io.on("connection", (socket) => {
    console.log("User connected");
    socket.on("joinGame", (gameId, playerId) => {
      try {
        if (!isValidGameID(gameId)) {
          throw new Error(`Invalid Game ID: ${gameId}`);
        }
        console.log(`user joined game ${gameId}`);
        if (!(playerId && uuidValidate(playerId) && uuidVersion(playerId) === 4)) {
          throw new Error(`Invalid Player ID: ${playerId}`);
        }
        let game = null;
        if (!games[gameId]) {
          throw new Error(`Can't find Game ID: ${gameId}`);
        } else {
          game = games[gameId];
          console.log(`Game existed: ${gameId}`);
        }
        socket.gameId = gameId;
        game.lastActivity = Date.now();
        socket.join(gameId);
        const player = game.serverGame.addPlayer({
          id: playerId,
          name: "Player",
          playerType: "Human" /* Human */
        });
        socket.player = player;
        io.to(gameId).emit("showNotification", {
          message: `\u05E9\u05D7\u05E7\u05DF/\u05D9\u05EA ${player.index + 1} \u05D4\u05EA\u05D7\u05D1\u05E8/\u05D4`
        });
        socket.emit("initBoard", {
          board: game.serverGame.board,
          player: Player.toJson(player),
          gameId,
          allPlayersJoined: game.serverGame.allPlayersJoined()
        });
        if (game.serverGame.allPlayersJoined()) {
          io.to(gameId).emit("gameUpdate", {
            board: null,
            currentPlayerIndex: game.serverGame.currentPlayer.index,
            moveDetails: null,
            swapDetails: null,
            points: JSON.stringify(Array.from(game.serverGame.getPoints().entries())),
            numTilesInBag: game.serverGame.bag.length
          });
        }
        if (game.serverGame.isGameOver()) {
          io.to(gameId).emit("gameOver", {
            winnerIndex: game.serverGame.getLeadingPlayer()
          });
        }
      } catch (error) {
        console.log(`Error: ${error}`);
        socket.emit("generalError", {
          error
        });
      }
    });
    socket.on("makeMove", (move) => {
      try {
        const gameId = socket.gameId;
        if (!gameId) {
          throw new Error("Game ID not found");
        }
        console.log(`user made a move in game ${gameId}`, move);
        const game = games[gameId];
        if (!game) {
          throw new Error(`Game ${gameId} not found`);
        }
        if (socket.player !== game.serverGame.currentPlayer) {
          throw new Error("Not your turn");
        }
        game.lastActivity = Date.now();
        let tilePlacements = move.map((tilePlacement) => {
          return {
            tile: game.serverGame.bag.getTileById(Tile.fromJson(tilePlacement.tile).id),
            r: tilePlacement.r,
            c: tilePlacement.c
          };
        });
        const moveDetails = game.serverGame.endTurnCallback(tilePlacements, false);
        console.log(`End of turn in game ${gameId}`);
        socket.emit("playerUpdate", {
          player: Player.toJson(socket.player)
        });
        io.to(gameId).emit("gameUpdate", {
          board: game.serverGame.board,
          currentPlayerIndex: game.serverGame.currentPlayer.index,
          moveDetails,
          swapDetails: null,
          points: JSON.stringify(Array.from(game.serverGame.getPoints().entries())),
          numTilesInBag: game.serverGame.bag.length
        });
        if (game.serverGame.isGameOver()) {
          io.to(gameId).emit("gameOver", {
            winnerIndex: game.serverGame.getLeadingPlayer()
          });
          if (!game.isMarkedForDelete) {
            setTimeout(() => {
              console.log(`Removing game ${gameId} after game over`);
              if (gameId in games) {
                delete games[gameId];
              }
            }, CLEANUP_DELAY);
            game.isMarkedForDelete = true;
          }
        }
      } catch (err) {
        if (err instanceof UserError) {
          socket.emit("showError", { type: err.type, extraData: err.extraData });
        }
        console.log(`Error: ${err}`);
      }
    });
    socket.on("swapTiles", (tiles) => {
      try {
        const gameId = socket.gameId;
        if (!gameId) {
          throw new Error("Game ID not found");
        }
        console.log(`user wants to swap tiles in game ${gameId}`, tiles);
        const game = games[gameId];
        if (!game) {
          throw new Error(`Game ${gameId} not found`);
        }
        if (socket.player !== game.serverGame.currentPlayer) {
          throw new Error("Not your turn");
        }
        game.lastActivity = Date.now();
        const swapDetails = game.serverGame.swapTiles(tiles.map((tile) => Tile.fromJson(tile)));
        console.log(`End of turn in game ${gameId}`);
        socket.emit("playerUpdate", {
          player: Player.toJson(socket.player)
        });
        io.to(gameId).emit("gameUpdate", {
          board: game.serverGame.board,
          currentPlayerIndex: game.serverGame.currentPlayer.index,
          moveDetails: null,
          swapDetails,
          points: JSON.stringify(Array.from(game.serverGame.getPoints().entries())),
          numTilesInBag: game.serverGame.bag.length
        });
      } catch (err) {
        if (err instanceof UserError) {
          socket.emit("showError", { type: err.type, extraData: err.extraData });
        }
        console.log(`Error: ${err}`);
      }
    });
    socket.on("disconnect", () => {
      try {
        console.log("user disconnected");
        const gameId = socket.gameId;
        if (gameId) {
          const playerIndex = socket.player ? socket.player.index + 1 : "";
          io.to(gameId).emit("showNotification", {
            message: `\u05E9\u05D7\u05E7\u05DF/\u05D9\u05EA ${playerIndex} \u05D4\u05EA\u05E0\u05EA\u05E7/\u05D4`
          });
        }
      } catch (error) {
        console.log(`Error: ${error}`);
      }
    });
  });
}

// src/index.ts
import cors from "cors";

// src/dawg/units.ts
var PRECISION_MASK = 4294967295;
var OFFSET_MAX = 1 << 21;
var IS_LEAF_BIT = 1 << 31;
var HAS_LEAF_BIT = 1 << 8;
var EXTENSION_BIT = 1 << 9;
function has_leaf(base, _mask = HAS_LEAF_BIT) {
  return base & _mask ? true : false;
}
function value(base, _mask = ~IS_LEAF_BIT & PRECISION_MASK) {
  return base & _mask;
}
function label(base, _mask = IS_LEAF_BIT | 255) {
  return base & _mask;
}
function offset(base) {
  return base >> 10 << ((base & EXTENSION_BIT) >> 6) & PRECISION_MASK;
}

// src/dawg/wrapper.ts
var Dictionary = class {
  _units;
  ROOT;
  constructor() {
    this._units = null;
    this.ROOT = 0;
  }
  /**
   * Checks if a given index is related to the end of a key.
   */
  has_value(index) {
    if (this._units == null) {
      return false;
    }
    return has_leaf(this._units[index]);
  }
  /**
   * Gets a value from a given index.
   */
  value(index) {
    if (this._units == null) {
      throw "Error: _units is null!";
    }
    const offset2 = offset(this._units[index]);
    const value_index = (index ^ offset2) & PRECISION_MASK;
    return value(this._units[value_index]);
  }
  /**
   * Reads a dictionary from an input stream.
   */
  read(raw_buffer) {
    let view = new DataView(raw_buffer);
    let base_size = view.getUint32(0, true);
    this._units = new Uint32Array(raw_buffer, 4, base_size);
  }
  /**
   * Exact matching.
   */
  contains(key) {
    const index = this.follow_bytes(key, this.ROOT);
    if (index === null) {
      return false;
    }
    return this.has_value(index);
  }
  /**
   * Exact matching (returns value)
   */
  find(key) {
    const index = this.follow_bytes(key, this.ROOT);
    if (index === null) {
      return -1;
    }
    if (!this.has_value(index)) {
      return -1;
    }
    return this.value(index);
  }
  /**
   * Follows a transition
   */
  follow_char(label2, index) {
    if (this._units == null) {
      throw "Error: _units is null!";
    }
    const offset2 = offset(this._units[index]);
    const next_index = (index ^ offset2 ^ label2) & PRECISION_MASK;
    if (label(this._units[next_index]) != label2) {
      return null;
    }
    return next_index;
  }
  /**
   * Follows transitions.
   */
  follow_bytes(s, index) {
    let i = index;
    for (let ch of s) {
      i = this.follow_char(ch, i);
      if (i === null) {
        return null;
      }
    }
    return i;
  }
};
var Guide = class {
  _units;
  ROOT;
  constructor() {
    this._units = null;
    this.ROOT = 0;
  }
  child(index) {
    if (this._units == null) {
      throw "Can't use Guide before reading into it.";
    }
    return this._units[index * 2];
  }
  sibling(index) {
    if (this._units == null) {
      throw "Can't use Guide before reading into it.";
    }
    return this._units[index * 2 + 1];
  }
  read(raw_buffer) {
    let view = new DataView(raw_buffer);
    let dict_size = view.getUint32(0, true);
    let guide_offset = 4 + dict_size * 4;
    let base_size = view.getUint32(guide_offset, true);
    this._units = new Uint8Array(raw_buffer, guide_offset + 4, base_size * 2);
  }
  size() {
    if (this._units == null) {
      throw "Can't use Guide before reading into it.";
    }
    return this._units.length;
  }
};
var Completer = class {
  _dic;
  _guide;
  _last_index;
  _index_stack;
  _parent_index;
  _sib_index;
  key;
  constructor(dic, guide) {
    this._dic = dic;
    this._guide = guide;
    this._last_index = -1;
    this._index_stack = [];
    this._parent_index = -1;
    this._sib_index = null;
    this.key = [];
  }
  value() {
    return this._dic.value(this._last_index);
  }
  start(index, prefix) {
    this.key = [...prefix];
    if (this._guide.size()) {
      this._index_stack = [index];
      this._last_index = this._dic.ROOT;
    } else {
      this._index_stack = [];
    }
  }
  start_edges(index, prefix) {
    this.key = [...prefix];
    this._parent_index = index;
    this._sib_index = null;
    if (this._guide.size() > 0) {
      let child_label = this._guide.child(index);
      if (child_label) {
        let next_index = this._dic.follow_char(child_label, index);
        if (index != null) {
          this._sib_index = next_index;
          this.key.push(child_label);
          return true;
        }
      }
    }
    return false;
  }
  next_edge() {
    if (this._sib_index == null) {
      return false;
    }
    let sibling_label = this._guide.sibling(this._sib_index);
    this._sib_index = this._dic.follow_char(sibling_label, this._parent_index);
    if (this._sib_index == null) {
      return false;
    }
    this.key.pop();
    this.key.push(sibling_label);
    return true;
  }
  /**
   * Gets the next key
   */
  next() {
    if (this._index_stack.length === 0) {
      return false;
    }
    let index = this._index_stack[this._index_stack.length - 1];
    if (this._last_index != this._dic.ROOT) {
      const child_label = this._guide.child(index);
      if (child_label) {
        index = this._follow(child_label, index);
        if (index === null) {
          return false;
        }
      } else {
        while (true) {
          let sibling_label = this._guide.sibling(index);
          if (this.key.length > 0) {
            this.key.pop();
          }
          this._index_stack.pop();
          if (this._index_stack.length === 0) {
            return false;
          }
          index = this._index_stack[this._index_stack.length - 1];
          if (sibling_label) {
            index = this._follow(sibling_label, index);
            if (index === null) {
              return false;
            }
            break;
          }
        }
      }
    }
    return this._find_terminal(index);
  }
  _follow(label2, index) {
    const next_index = this._dic.follow_char(label2, index);
    if (next_index === null) {
      return null;
    }
    this.key.push(label2);
    this._index_stack.push(next_index);
    return next_index;
  }
  _find_terminal(index) {
    while (!this._dic.has_value(index)) {
      let label2 = this._guide.child(index);
      let i = this._dic.follow_char(label2, index);
      if (index === null) {
        return false;
      }
      index = i;
      this.key.push(label2);
      this._index_stack.push(index);
    }
    this._last_index = index;
    return true;
  }
};

// src/dawg/dawgs.ts
var CompletionDAWG = class {
  dct;
  guide;
  constructor() {
    this.dct = null;
    this.guide = null;
  }
  keys(prefix = "") {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8");
    const b_prefix = encoder.encode(prefix);
    const res = [];
    if (this.dct == null || this.guide == null) {
      throw "Dictionary must be loaded first!";
    }
    const index = this.dct.follow_bytes(b_prefix, this.dct.ROOT);
    if (index === null) {
      return res;
    }
    const completer = new Completer(this.dct, this.guide);
    completer.start(index, b_prefix);
    while (completer.next()) {
      let key = decoder.decode(new Uint8Array(completer.key));
      res.push(key);
    }
    return res;
  }
  edges(prefix = "") {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8");
    const b_prefix = encoder.encode(prefix);
    const res = [];
    if (this.dct == null || this.guide == null) {
      throw "Dictionary must be loaded first!";
    }
    const index = this.dct.follow_bytes(b_prefix, this.dct.ROOT);
    if (index === null) {
      return res;
    }
    const completer = new Completer(this.dct, this.guide);
    if (!completer.start_edges(index, b_prefix)) {
      return res;
    }
    let key = decoder.decode(new Uint8Array(completer.key));
    res.push(key.slice(-1));
    while (completer.next_edge()) {
      key = decoder.decode(new Uint8Array(completer.key));
      res.push(key.slice(-1));
    }
    return res;
  }
  contains(key) {
    const encoder = new TextEncoder();
    const b_key = encoder.encode(key);
    if (this.dct == null || this.guide == null) {
      throw "Dictionary must be loaded first!";
    }
    return this.dct.contains(b_key);
  }
  load(raw_bytes) {
    this.dct = new Dictionary();
    this.guide = new Guide();
    this.dct.read(raw_bytes);
    this.guide.read(raw_bytes);
    return this;
  }
};

// src/Dictionary.ts
import { promises as fs } from "fs";
import * as path from "path";
var Dictionary2 = class {
  dawg;
  translateMapping;
  reverseTranslateMapping;
  _alphabet;
  /**
   * Constructor for Dictionary class.
   */
  constructor() {
    this.dawg = null;
    this.translateMapping = { "": "" };
    this.reverseTranslateMapping = { "": "" };
    this._alphabet = /* @__PURE__ */ new Set();
  }
  /**
   * Initializes the dictionary by loading the word list.
   */
  async init(basePath) {
    const configPath = path.join(basePath, "wordlists", "config.json");
    const configRaw = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(configRaw);
    this.translateMapping = config["translate_mapping"];
    this.reverseTranslateMapping = config["reverse_translate_mapping"];
    for (const key in this.translateMapping) {
      this._alphabet.add(key);
    }
    const dirName = "hspell";
    const wordlistConfig = config["wordlists"][dirName];
    if (wordlistConfig["type"] !== "dawg") {
      throw new Error(`Unsupported file type: ${wordlistConfig["type"]}`);
    }
    const dictPath = path.join(basePath, "wordlists", dirName, wordlistConfig["filename"]);
    let rawDictionary;
    try {
      const buffer = await fs.readFile(dictPath);
      rawDictionary = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log("Can't find database");
      }
      throw new Error(`An error has occurred while loading the dictionary: ${err.message}`);
    }
    this.dawg = new CompletionDAWG();
    const startTime = performance.now();
    this.dawg.load(rawDictionary);
    const endTime = performance.now();
    console.log(`Loaded DAWG database in ${endTime - startTime} milliseconds`);
  }
  /*
   * Words in the dictionary might be encoded in a different encoding.
   * For example, the Hebrew dictionary is encoded with English characters.
   * This function translates the word in from its original encoding (e.g Hebrew)
   * to the encoding used in the raw dictionary representation (e.g. English characters).
   */
  directTranslation(word) {
    return word.replace(/(\?|[\u0590-\u05fe])/g, (m) => this.translateMapping[m]);
  }
  /*
   * Performs the reverse translation for directTranslation().
   */
  reverseTranslation(word) {
    return word.replace(/(\?|[a-zA-Z])/g, (m) => this.reverseTranslateMapping[m]);
  }
  /**
   * Checks if a word is in the dictionary.
   * @param word - The word to check.
   * @returns True if the word is in the dictionary, false otherwise.
   */
  contains(word) {
    if (this.dawg == null) {
      throw new Error("Dictionary must be loaded before using it");
    }
    return this.dawg.contains(this.directTranslation(word) + "\r");
  }
  /**
   * Returns all words in the dictionary that start with a given prefix.
   * @param prefix - The prefix to search for.
   * @returns A set of the next letter for all words in the dictionary that start with the given prefix.
   */
  edges(prefix) {
    if (this.dawg == null) {
      throw new Error("Dictionary must be loaded before using it");
    }
    const res = new Set(this.dawg.edges(this.directTranslation(prefix)).map((x) => this.reverseTranslation(x)));
    res.delete("\r");
    return res;
  }
  /**
   * Getter for the alphabet of the dictionary.
   * @returns A set containing all characters in the alphabet of the dictionary.
   */
  get alphabet() {
    return new Set(this._alphabet);
  }
};

// src/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express();
var port = process.env.PORT || 8080;
async function initializeServer() {
  const dictionary = new Dictionary2();
  await dictionary.init(path2.join(__dirname, "..", "..", "client", "public"));
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      // Allow requests from any origin
      methods: ["GET", "POST"]
      // Allow these HTTP methods
    }
  });
  app.use(cors());
  app.use(express.json());
  onlineGameManager(io, dictionary);
  createNewGame(dictionary, "test");
  app.post("/createGame", (req, res) => {
    try {
      const gameId = createNewGame(dictionary, null);
      res.json({ gameId });
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ error: "Failed to create game" });
    }
  });
  app.post("/gameExists", (req, res) => {
    try {
      const gameId = req.body.gameId;
      if (!gameId) {
        return res.status(400).json({ error: "gameId is required" });
      }
      const gameExists = checkGameId(gameId);
      res.json({ gameId, gameExists });
    } catch (error) {
      console.error("Error checking gameId:", error);
      res.status(500).json({ error: "Failed to check gameId" });
    }
  });
  app.post("/checkWord", (req, res) => {
    try {
      const word = req.body.word;
      if (!word) {
        return res.status(400).json({ error: "Word is required" });
      }
      const isValid = dictionary.contains(word);
      console.log(`Checked word: ${word}, Is Valid: ${isValid}`);
      res.json({ word, isValid });
    } catch (error) {
      console.error("Error checking word:", error);
      res.status(500).json({ error: "Failed to check word" });
    }
  });
  app.use(express.static(path2.join(__dirname, "../../client/public/")));
  app.get("*", (req, res) => {
    console.log("request received");
    res.sendFile(path2.join(__dirname, "../../client/public/index.html"));
  });
  server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}
initializeServer();
//# sourceMappingURL=index.js.map