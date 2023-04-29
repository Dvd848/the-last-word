import * as Constants from "./Constants"

/**
 * Shuffle an array
 * https://stackoverflow.com/questions/48083353/
 */
export function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length,  randomIndex;
    
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    
    return array;
};
    
/**
 * Returns True of the given key is a key of the given object
 * @param key The key
 * @param obj The object
 * @returns True if the given key is a key of the given object
 */
export function isKeyOfObject<T extends object>(
    key: string | number | symbol,
    obj: T,
): key is keyof T {
    return key in obj;
}
