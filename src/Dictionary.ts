

import { CompletionDAWG } from "./dawg/dawgs";
import * as Constants from "./Constants";

export default class Dictionary 
{ 
    private dawg : CompletionDAWG | null;
    private language : Constants.Languages;
    private translateMapping : Record<string, string>;
    private reverseTranslateMapping : Record<string, string>;
    private _alphabet : Set<string>;

    constructor(language: Constants.Languages)
    {
        this.language = language;
        this.dawg = null;
        this.translateMapping = {"": ""};
        this.reverseTranslateMapping = {"": ""};
        this._alphabet = new Set<string>();
    }

    async init() 
    {
        let response = await fetch(`wordlists/config.json`);
        const config = await response.json();
        this.translateMapping = config["translate_mapping"] as Record<string, string>;
        this.reverseTranslateMapping = config["reverse_translate_mapping"] as Record<string, string>;
        for (const key in this.translateMapping) {
            this._alphabet.add(key);
        };

        const dirName = "hspell";
        if (config["wordlists"][dirName]["type"] != "dawg")
        {
            throw new Error(`Unsupported file type: ${config["wordlists"][dirName]["type"]}`);
        }

        response = await fetch(`wordlists/${dirName}/${config["wordlists"][dirName]["filename"]}`);
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
        console.log(`Loaded DAWG database in ${endTime - startTime} milliseconds`);
    }

    private directTranslation(word: string) : string
    {
        // e.g. Hebrew characters to English characters
        return word.replace(/(\?|[\u0590-\u05fe])/g, m => this.translateMapping[m]);
    }

    private reverseTranslation(word: string) : string
    {
        return word.replace(/(\?|[a-zA-Z])/g, m => this.reverseTranslateMapping[m]);
    }

    public contains(word: string) : boolean
    {
        if (this.dawg == null)
        {
            throw new Error("Dictionary must be loaded before using it");
        }

        return this.dawg.contains(this.directTranslation(word) + "\r");
    }

    public edges(prefix: string) : Set<string>
    {
        if (this.dawg == null)
        {
            throw new Error("Dictionary must be loaded before using it");
        }

        const res = new Set<string>(this.dawg.edges(this.directTranslation(prefix)).map((x: string) => this.reverseTranslation(x)));
        res.delete("\r");
        return res;
    }

    get alphabet() : Set<string>
    {
        return new Set<string>(this._alphabet);
    }
}