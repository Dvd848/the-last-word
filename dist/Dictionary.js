var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CompletionDAWG } from "./dawg/dawgs.js";
export default class Dictionary {
    constructor(language) {
        this.language = language;
        this.dawg = null;
        this.translateMapping = { "": "" };
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield fetch(`wordlists/config.json`);
            const config = yield response.json();
            this.translateMapping = config["translate_mapping"];
            response = yield fetch(`wordlists/hspell/e.dawg`);
            if (!response.ok) {
                if (response.status == 404) {
                    console.log(`Can't find database`);
                }
                throw new Error(`An error has occurred while loading the dictionary: ${response.status}`);
            }
            let rawDictionary = yield response.arrayBuffer();
            this.dawg = new CompletionDAWG();
            let startTime = performance.now();
            this.dawg.load(rawDictionary);
            let endTime = performance.now();
            console.log(`Loaded DAWG database in ${endTime - startTime} milliseconds`);
        });
    }
    heb2eng(word) {
        return word.replace(/(\?|[\u0590-\u05fe])/g, m => this.translateMapping[m]);
    }
    contains(word) {
        if (this.dawg == null) {
            throw new Error("Dictionary must be loaded before using it");
        }
        return this.dawg.contains(this.heb2eng(word) + "\r");
    }
}
