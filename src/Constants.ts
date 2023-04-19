export const Constants = {
    BOARD_DIMENSIONS: 15,
    TILES_PER_PLAYER: 7
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