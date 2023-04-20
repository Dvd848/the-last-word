# Word-List Creation

In order to generate the word-list for the application:

 1. Follow the instructions [here](https://github.com/Dvd848/Crossword-Solver/tree/main/utils/words) and generate `words_hspell.txt`.
 2. Copy `words_hspell.txt` to this directory.
 3. Run `word_processor.py` from this directory to process the output of step #1, create a database of words and compress it as a DAWG.  
    This also creates the `config.json` file for the application.  
    The output is saved under `../../wordlists/`

