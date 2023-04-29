

import { CompletionDAWG } from "./dawg/dawgs";
import { Languages } from "./Strings";

/**
 * Dictionary class represents the dictionary.
 * @class
 */
export default class Dictionary 
{ 
    private dawg : CompletionDAWG | null;
    private language : Languages;
    private translateMapping : Record<string, string>;
    private reverseTranslateMapping : Record<string, string>;
    private _alphabet : Set<string>;

    /**
     * Constructor for Dictionary class.
     * @param language - The language of the dictionary.
     */
    constructor(language: Languages)
    {
        this.language = language;
        this.dawg = null;
        this.translateMapping = {"": ""};
        this.reverseTranslateMapping = {"": ""};
        this._alphabet = new Set<string>();
    }

    /**
     * Initializes the dictionary by loading the word list.
     */
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

    /*
     * Words in the dictionary might be encoded in a different encoding.
     * For example, the Hebrew dictionary is encoded with English characters.
     * This function translates the word in from its original encoding (e.g Hebrew)
     * to the encoding used in the raw dictionary representation (e.g. English characters).
     */
    private directTranslation(word: string) : string
    {
        if (this.language == Languages.Hebrew)
        {
            // Hebrew characters to English characters
            return word.replace(/(\?|[\u0590-\u05fe])/g, m => this.translateMapping[m]);
        }
        return word;
    }

    /*
     * Performs the reverse translation for directTranslation().
     */
    private reverseTranslation(word: string) : string
    {
        if (this.language == Languages.Hebrew)
        {
            return word.replace(/(\?|[a-zA-Z])/g, m => this.reverseTranslateMapping[m]);
        }
        return word;
    }

    /**
     * Checks if a word is in the dictionary.
     * @param word - The word to check.
     * @returns True if the word is in the dictionary, false otherwise.
     */
    public contains(word: string) : boolean
    {
        if (this.dawg == null)
        {
            throw new Error("Dictionary must be loaded before using it");
        }

        return this.dawg.contains(this.directTranslation(word) + "\r");
    }

    /**
     * Returns all words in the dictionary that start with a given prefix.
     * @param prefix - The prefix to search for.
     * @returns A set of the next letter for all words in the dictionary that start with the given prefix.
     */
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

    /**
     * Getter for the alphabet of the dictionary.
     * @returns A set containing all characters in the alphabet of the dictionary.
     */
    get alphabet() : Set<string>
    {
        return new Set<string>(this._alphabet);
    }
}