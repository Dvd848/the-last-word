

import { CompletionDAWG } from "./dawg/dawgs.js";
import * as Constants from "./Constants.js";

export default class Dictionary 
{ 
    private dawg : CompletionDAWG | null;
    private language : Constants.Languages;
    private translateMapping : Record<string, string>;

    constructor(language: Constants.Languages)
    {
        this.language = language;
        this.dawg = null;
        this.translateMapping = {"": ""};
    }

    async init() 
    {
        let response = await fetch(`wordlists/config.json`);
        const config = await response.json();
        this.translateMapping = config["translate_mapping"];

        response = await fetch(`wordlists/hspell/e.dawg`);
        if (!response.ok) {
            if (response.status == 404) {
                console.log(`Can't find database`);
            }
            throw new Error(`An error has occurred while loading the dictionary: ${response.status}`);
        }

        let rawDictionary = await response.arrayBuffer();
        this.dawg = new CompletionDAWG();
            
        let startTime = performance.now();
        this.dawg.load(rawDictionary);
        let endTime = performance.now();
        console.log(`Loaded DAWG database in ${endTime - startTime} milliseconds`)        
    }

    private heb2eng(word: string) : string
    {
        return word.replace(/(\?|[\u0590-\u05fe])/g, m => this.translateMapping[m]);
    }

    public contains(word: string) : boolean
    {
        if (this.dawg == null)
        {
            throw new Error("Dictionary must be loaded before using it");
        }

        return this.dawg.contains(this.heb2eng(word) + "\r");
    }
}