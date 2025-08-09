

import { CompletionDAWG } from "./dawg/dawgs.js";
import {Languages} from '../../shared/src/Constants.js'
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Dictionary class represents the dictionary.
 * @class
 */
export default class Dictionary 
{ 
    private dawg : CompletionDAWG | null;
    private translateMapping : Record<string, string>;
    private reverseTranslateMapping : Record<string, string>;
    private _alphabet : Set<string>;

    /**
     * Constructor for Dictionary class.
     */
    constructor()
    {
        this.dawg = null;
        this.translateMapping = {"": ""};
        this.reverseTranslateMapping = {"": ""};
        this._alphabet = new Set<string>();
    }

    /**
     * Initializes the dictionary by loading the word list.
     */
    async init(basePath: string): Promise<void> {
        const configPath = path.join(basePath, 'wordlists', 'config.json');
        const configRaw = await fs.readFile(configPath, 'utf8');
        const config = JSON.parse(configRaw);

        this.translateMapping = config["translate_mapping"] as Record<string, string>;
        this.reverseTranslateMapping = config["reverse_translate_mapping"] as Record<string, string>;

        for (const key in this.translateMapping) {
            this._alphabet.add(key);
        }

        const dirName = "hspell";
        const wordlistConfig = config["wordlists"][dirName];

        if (wordlistConfig["type"] !== "dawg") {
            throw new Error(`Unsupported file type: ${wordlistConfig["type"]}`);
        }

        const dictPath = path.join(basePath, 'wordlists', dirName, wordlistConfig["filename"]);

        let rawDictionary: ArrayBuffer;
        try {
            const buffer = await fs.readFile(dictPath);
            rawDictionary = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        } catch (err: any) {
            if (err.code === 'ENOENT') {
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
    private directTranslation(word: string) : string
    {        
        // Hebrew characters to English characters
        return word.replace(/(\?|[\u0590-\u05fe])/g, m => this.translateMapping[m]);
    }

    /*
     * Performs the reverse translation for directTranslation().
     */
    private reverseTranslation(word: string) : string
    {
        return word.replace(/(\?|[a-zA-Z])/g, m => this.reverseTranslateMapping[m]);
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