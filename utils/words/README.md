# Word-List Creation

In order to generate the word-list for the application:

 1. Using [hspell](http://hspell.ivrix.org.il/), generate `woo.txt`, `wolig.txt`, `extrawords.txt` and `shemp.txt` (see reference below)
    a. `extrawords.txt` might require a bit of manual editing since it mixes legal words with illegal words (names etc.) in a way that's hard to programmatically separate
 2. Copy both files to this directory.
 3. Run `parser.py` from this directory. This should produce a file called `words_hspell.txt`.
 4. Run `word_processor.py` from this directory to process the output of step #3, create a database of words and compress it as a DAWG.  
    This also creates the `config.json` file for the application.  
    The output is saved under `../../wordlists/`

## HSpell Reference

In order to generate the text files from the first step above, one can use the following sequence:

```console
$ wget http://hspell.ivrix.org.il/hspell-1.4.tar.gz
$ tar -xvf hspell-1.4.tar.gz
$ cd hspell-1.4
$ 
$ perl wolig.pl | iconv -f ISO-8859-8 -t UTF-8 > /tmp/wolig.txt
$ ./woo | iconv -f ISO-8859-8 -t UTF-8 > /tmp/woo.txt 
$ 
$ export PERL5LIB=.
$ cat extrawords.hif | perl binarize-desc.pl | iconv -f ISO-8859-8 -t UTF-8 | awk '{print $1}' > /tmp/extrawords.txt
$ 
$ perl  -w wolig.pl -d shemp.dat | iconv -f ISO-8859-8 -t UTF-8 | awk '{print $1}' > /tmp/shemp.txt
```