import * as Utils from './Utils'

export enum Languages {
    English = "English",
    Hebrew = "Hebrew"
}

export const DefaultLanguage = Languages.Hebrew;

export const lastLetterTranslations : Record<Languages, Record<string, string>> = {
    [Languages.English]: {

    },
    [Languages.Hebrew]: {
        "נ": "ן",
        "מ": "ם",
        "פ": "ף",
        "צ": "ץ",
        "כ": "ך"
    }
}

/**
 * Helper function to get the translation for a given string ID
 * @param lang The language
 * @param str The string ID
 * @returns The matching string
 */
export function getTranslation(lang: Languages, str: Strings) : string
{
    return Translations[lang]?.[str] || "";
}

export function getStr(str: Strings) : string
{
    return getTranslation(DefaultLanguage, str);
}

/**
     * Helper function to translate the last letter of a word to the correct display format, if the language requires that.
     * For example, "Otiot Sofiot" in Hebrew.
     * @param word The word to translate if needed
     * @returns The new representation of the word, where the last letter is adjusted as needed
     */
export function translateLastLetter(word: string) : string
{
    let lastChar = word.slice(-1);
    if (Utils.isKeyOfObject(lastChar, lastLetterTranslations[Languages.Hebrew]))
    {
        word = word.slice(0, -1) + lastLetterTranslations[Languages.Hebrew][lastChar];
    }
    return word;
}

export enum Strings {
    EndTurn,
    PlayerInfoTitle,
    PlayerInfoPoints,
    ErrorConsecutive,
    ErrorConnected,
    ErrorExisting,
    ErrorIllegalWord,
    ErrorFirstWordMin,
    ErrorFirstWordLocation,
    Close,
    Error,
    Bonus,
    PlayerSkippedMove,
    TilesSwapped,
    GameOver,
    Tie,
    PlayerWon,
    Included,
    NotIncluded,
    IsWordInDict,
    Objection
}

export const Translations : Record<Languages, Record<Strings, string>> = {
    [Languages.English]: {
        [Strings.EndTurn]: "End Turn",
        [Strings.PlayerInfoTitle]: "${name}'s Move",
        [Strings.PlayerInfoPoints]: "${points} points",
        [Strings.ErrorConsecutive]: "The tiles must be placed consecutively horizontally or vertically!",
        [Strings.ErrorConnected]: "One or more tiles are not connected to an existing tile"!,
        [Strings.ErrorExisting]: "One or more tiles are placed on an existing tile!",
        [Strings.ErrorIllegalWord]: "The following words are not included in our dictionary:",
        [Strings.ErrorFirstWordMin]: "The first word must be at least 2 letters long!",
        [Strings.ErrorFirstWordLocation]: "The first word must be placed on the center tile!",
        [Strings.Close]: "Close",
        [Strings.Error]: "Error",
        [Strings.Bonus]: "Bonus for using all letters",
        [Strings.PlayerSkippedMove]: "Move skipped.",
        [Strings.TilesSwapped]: "The following tiles were swapped: ${tiles}",
        [Strings.GameOver]: "Game Over",
        [Strings.Tie]: "The result is a tie.",
        [Strings.PlayerWon]: "Player ${player} won!",
        [Strings.Included]: "is included",
        [Strings.NotIncluded]: "is not included",
        [Strings.IsWordInDict]: "The word \"${word}\" ${included} in the dictionary",
        [Strings.Objection]: "Objection"
    },

    [Languages.Hebrew]: {
        [Strings.EndTurn]: "סיום תור",
        [Strings.PlayerInfoTitle]: "המהלך של ${name}",
        [Strings.PlayerInfoPoints]: "${points} נקודות",
        [Strings.ErrorConsecutive]: "על האותיות להיות מונחות ברצף במאוזן או במאונך!",
        [Strings.ErrorConnected]: "לפחות אחת האותיות צריכה להיות מחוברת לאות קיימת!",
        [Strings.ErrorExisting]: "אין להניח אות על אות קיימת!",
        [Strings.ErrorIllegalWord]: "המילים הבאות לא נכללות במילון שלנו:",
        [Strings.ErrorFirstWordMin]: "על המילה הראשונה לכלול לפחות שתי אותיות!",
        [Strings.ErrorFirstWordLocation]: "על המילה הראשונה להיות מונחת במשבצת המרכזית!",
        [Strings.Close]: "סגירה",
        [Strings.Error]: "שגיאה",
        [Strings.Bonus]: "בונוס על שימוש בכל האותיות",
        [Strings.PlayerSkippedMove]: "דילוג על התור",
        [Strings.TilesSwapped]: "האותיות הבאות הוחלפו: ${tiles}",
        [Strings.GameOver]: "המשחק הסתיים",
        [Strings.Tie]: "התוצאה היא שיוויון",
        [Strings.PlayerWon]: "${player} ניצח/ה!",
        [Strings.Included]: "נכללת",
        [Strings.NotIncluded]: "לא נכללת",
        [Strings.IsWordInDict]: "המילה \"${word}\" ${included} במילון",
        [Strings.Objection]: "ערעור"
    },
}

