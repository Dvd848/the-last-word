export const Constants = {
    BOARD_DIMENSIONS: 15,
    TILES_PER_PLAYER: 7,
    CENTER_TILE_ROW: 7,
    CENTER_TILE_COL: 7
}

export enum Languages {
    English = "English",
    Hebrew = "Hebrew"
}

export const scrabbleTiles : Record<Languages, { letter: string; count: number; points: number; }[]> = 
{
    [Languages.Hebrew]: [
        { letter: "א", count: 9, points: 1 },
        { letter: "ב", count: 2, points: 2 },
        { letter: "ג", count: 3, points: 1 },
        { letter: "ד", count: 3, points: 1 },
        { letter: "ה", count: 2, points: 2 },
        { letter: "ו", count: 4, points: 1 },
        { letter: "ז", count: 1, points: 1 },
        { letter: "ח", count: 2, points: 3 },
        { letter: "ט", count: 1, points: 2 },
        { letter: "י", count: 4, points: 1 },
        { letter: "כ", count: 3, points: 3 },
        { letter: "ל", count: 4, points: 1 },
        { letter: "מ", count: 3, points: 2 },
        { letter: "נ", count: 5, points: 1 },
        { letter: "ס", count: 7, points: 1 },
        { letter: "ע", count: 5, points: 1 },
        { letter: "פ", count: 3, points: 2 },
        { letter: "צ", count: 1, points: 4 },
        { letter: "ק", count: 1 ,points: 5 },
        { letter: "ר", count: 4 ,points: 1 },
        { letter: "ש", count: 4 ,points: 2 },
        { letter: "ת", count: 4 ,points: 2 },
        //TODO: { letter: " ", count: 2 ,points: 0 }
    ],

    [Languages.English]: [
        { letter: 'A', count: 9,  points: 1  },
        { letter: 'B', count: 2,  points: 3  },
        { letter: 'C', count: 2,  points: 3  },
        { letter: 'D', count: 4,  points: 2  },
        { letter: 'E', count: 12, points: 1  },
        { letter: 'F', count: 2,  points: 4  },
        { letter: 'G', count: 3,  points: 2  },
        { letter: 'H', count: 2,  points: 4  },
        { letter: 'I', count: 9,  points: 1  },
        { letter: 'J', count: 1,  points: 8  },
        { letter: 'K', count: 1,  points: 5  },
        { letter: 'L', count: 4,  points: 1  },
        { letter: 'M', count: 2,  points: 3  },
        { letter: 'N', count: 6,  points: 1  },
        { letter: 'O', count: 8,  points: 1  },
        { letter: 'P', count: 2,  points: 3  },
        { letter: 'Q', count: 1,  points: 10 },
        { letter: 'R', count: 6,  points: 1  },
        { letter: 'S', count: 4,  points: 1  },
        { letter: 'T', count: 6,  points: 1  },
        { letter: 'U', count: 4,  points: 1  },
        { letter: 'V', count: 2,  points: 4  },
        { letter: 'W', count: 2,  points: 4  },
        { letter: 'X', count: 1,  points: 8  },
        { letter: 'Y', count: 2,  points: 4  },
        { letter: 'Z', count: 1,  points: 10 },
        //TODO: { letter: " ", count: 2,  points: 0 }
    ]
};

export enum TileTypes {
    Regular      = "Regular",
    DoubleWord   = "DoubleWord",
    DoubleLetter = "DoubleLetter",
    TripleWord   = "TripleWord",
    TripleLetter = "TripleLetter",
    CenterTile   = "CenterTile"
}

export const tileMultipliers : Record<TileTypes, {wordMul: number, letterMul: number, coordinates: { row: number; col: number; }[]}> = {
    [TileTypes.DoubleWord]: {
        wordMul : 2,
        letterMul: 1,
        coordinates: [
            { row: 1,  col: 1  },
            { row: 2,  col: 2  },
            { row: 3,  col: 3  },
            { row: 4,  col: 4  },
            { row: 10, col: 10 },
            { row: 11, col: 11 },
            { row: 12, col: 12 },
            { row: 13, col: 13 },
            { row: 1,  col: 13 },
            { row: 2,  col: 12 },
            { row: 3,  col: 11 },
            { row: 4,  col: 10 },
            { row: 10, col: 4  },
            { row: 11, col: 3  },
            { row: 12, col: 2  },
            { row: 13, col: 1  }
        ]
    },

    [TileTypes.DoubleLetter]: {
        wordMul : 1,
        letterMul: 2,
        coordinates: [
            { row: 0,  col: 3  },
            { row: 0,  col: 11 },
            { row: 2,  col: 6  },
            { row: 2,  col: 8  },
            { row: 3,  col: 0  },
            { row: 3,  col: 7  },
            { row: 3,  col: 14 },
            { row: 6,  col: 2  },
            { row: 6,  col: 6  },
            { row: 6,  col: 8  },
            { row: 6,  col: 12 },
            { row: 7,  col: 3  },
            { row: 7,  col: 11 },
            { row: 8,  col: 2  },
            { row: 8,  col: 6  },
            { row: 8,  col: 8  },
            { row: 8,  col: 12 },
            { row: 11, col: 0  },
            { row: 11, col: 7  },
            { row: 11, col: 14 },
            { row: 12, col: 6  },
            { row: 12, col: 8  },
            { row: 14, col: 3  },
            { row: 14, col: 11 }
        ]
    },
    [TileTypes.TripleWord]: {
        wordMul : 3,
        letterMul: 1,
        coordinates: [
            { row: 0,  col: 0  },
            { row: 0,  col: 7  },
            { row: 0,  col: 14 },
            { row: 7,  col: 0  },
            { row: 7,  col: 14 },
            { row: 14, col: 0  },
            { row: 14, col: 7  },
            { row: 14, col: 14 }
        ]
    },

    [TileTypes.TripleLetter]: {
        wordMul : 1,
        letterMul: 3,
        coordinates: [
            { row: 1,  col: 5  },
            { row: 1,  col: 9  },
            { row: 5,  col: 1  },
            { row: 5,  col: 5  },
            { row: 5,  col: 9  },
            { row: 5,  col: 13 },
            { row: 9,  col: 1  },
            { row: 9,  col: 5  },
            { row: 9,  col: 9  },
            { row: 9,  col: 13 },
            { row: 13, col :5  },
            { row: 13, col :9  }
        ]
    },

    [TileTypes.Regular]: {
        wordMul : 1,
        letterMul: 1,
        coordinates: [

        ]
    },

    [TileTypes.CenterTile]: {
        wordMul : 1,
        letterMul: 1,
        coordinates: [
            { row: Constants.CENTER_TILE_ROW, col: Constants.CENTER_TILE_COL }
        ]
    },

}