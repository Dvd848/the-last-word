import * as Constants from "./Constants.js";
// https://stackoverflow.com/questions/48083353/
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}
;
export function getTranslation(lang, str) {
    var _a;
    return ((_a = Constants.Translations[lang]) === null || _a === void 0 ? void 0 : _a[str]) || "";
}
