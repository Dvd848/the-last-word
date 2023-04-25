# Word-List Creation

In order to generate the word-list for the application:

 1. Using [hspell](http://hspell.ivrix.org.il/), generate `woo.txt` and `wolig.txt` (see reference below)
 2. Copy both files to this directory.
 3. Run `parser.py` from this directory. This should produce a file called `words_hspell.txt`.
 4. Run `word_processor.py` from this directory to process the output of step #3, create a database of words and compress it as a DAWG.  
    This also creates the `config.json` file for the application.  
    The output is saved under `../../wordlists/`

# HSpell Reference

In order to generate `wolig.txt` and `woo.txt`, one can use the following sequence:

```console
wget http://hspell.ivrix.org.il/hspell-1.4.tar.gz
tar -xvf hspell-1.4.tar.gz
cd hspell-1.4
perl wolig.pl | iconv -f ISO-8859-8 -t UTF-8 > /tmp/wolig.txt
./woo | iconv -f ISO-8859-8 -t UTF-8 > /tmp/woo.txt 
```